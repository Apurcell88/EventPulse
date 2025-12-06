import { Request, Response } from "express";
import prisma from "../prismaClient";
import cloudinary from "../utils/cloudinary";
import archiver from "archiver";

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Cloudinary returns these via multer-storage-cloudinary
    const fileUrl = (req.file as any).path;
    const publicId = (req.file as any).filename; // This is Cloudinary's public_id
    const filename = req.file.originalname;

    const eventId = Number(req.params.eventId);

    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid eventId" });
    }

    const newFile = await prisma.file.create({
      data: {
        url: fileUrl,
        publicId,
        filename,
        eventId,
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // Emit real-time update
    const io = req.app.get("io");
    io.to(`event_${eventId}`).emit("file_uploaded", newFile);

    // Notifications for participants
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        rsvps: { include: { user: true } },
        creator: true,
      },
    });

    if (event) {
      const recipients = new Set<number>();

      recipients.add(event.creatorId);
      event.rsvps.forEach((rsvp) => {
        if (rsvp.userId) recipients.add(rsvp.userId);
      });

      recipients.delete(req.user.id);

      const notificationText = `${req.user.name} uploaded "${filename}" to "${event.title}"`;

      for (const userId of recipients) {
        const notification = await prisma.notification.create({
          data: {
            type: "file",
            message: notificationText,
            userId,
            eventId: event.id,
          },
          include: {
            event: { select: { id: true, title: true } },
          },
        });

        io.to(`user_${userId}`).emit("notification", notification);
      }
    }

    res.json(newFile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};

export const getFiles = async (req: Request, res: Response) => {
  try {
    const eventId = Number(req.params.eventId);

    const files = await prisma.file.findMany({
      where: { eventId },
      orderBy: { uploadedAt: "desc" },
      include: { user: { select: { id: true, name: true } } },
    });

    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load files" });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    const fileId = Number(req.params.fileId);

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Only the user who uploaded the file can delete it
    if (file.userId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete" });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(file.publicId, {
      resource_type: "raw",
    });

    // Delete from DB
    await prisma.file.delete({
      where: { id: fileId },
    });

    // Emit socket update to other users
    const io = req.app.get("io");
    io.to(`event_${file.eventId}`).emit("file_deleted", { fileId });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
};

export const downloadEventZip = async (req: Request, res: Response) => {
  try {
    const eventId = Number(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid eventId" });
    }

    // Get files for this event
    const files = await prisma.file.findMany({
      where: { eventId },
    });

    if (!files.length) {
      return res.status(404).json({ error: "No files found" });
    }

    // Set response headers
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=event_${eventId}_files.zip`
    );

    // Create ZIP stream
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    // Download each file from Cloudinary and append to ZIP
    for (const file of files) {
      const response = await fetch(file.url);

      if (!response.ok) {
        console.error("Failed to fetch:", file.url);
        continue;
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      archive.append(buffer, { name: file.filename });
    }

    await archive.finalize();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate ZIP" });
  }
};
