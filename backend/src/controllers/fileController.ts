import { Request, Response } from "express";
import prisma from "../prismaClient";

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

    const eventId = Number(req.body.eventId);

    const newFile = await prisma.file.create({
      data: {
        url: fileUrl,
        publicId: publicId,
        filename: filename,
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
