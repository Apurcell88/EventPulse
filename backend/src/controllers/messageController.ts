import { Request, Response } from "express";
import prisma from "../prismaClient";

export const getMessagesForEvent = async (req: Request, res: Response) => {
  try {
    const eventId = Number(req.params.eventId);

    const messages = await prisma.message.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load messages" });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    const { eventId, text } = req.body;
    const numericEventId = Number(eventId);

    const newMsg = await prisma.message.create({
      data: {
        text,
        eventId: numericEventId,
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    const io = req.app.get("io");

    // Emit chat message to event room
    io.to(`event_${numericEventId}`).emit("receive_message", newMsg);

    // Create notifications for other participants
    const event = await prisma.event.findUnique({
      where: { id: numericEventId },
      include: {
        rsvps: { include: { user: true } },
        creator: true,
      },
    });

    if (event) {
      const recipients = new Set<number>();

      // Event creator
      recipients.add(event.creatorId);

      // All attendees (or you can include pending/declined too if you want)
      event.rsvps.forEach((rsvp) => {
        if (rsvp.userId) recipients.add(rsvp.userId);
      });

      // Don't notify the sender
      recipients.delete(req.user.id);

      const notificationText = `sent a message in "${event.title}"`;

      // Create + emit per recipient
      for (const userId of recipients) {
        const notification = await prisma.notification.create({
          data: {
            type: "message",
            message: notificationText,
            userId,
            eventId: event.id,
            actorId: req.user.id, // who triggered it
          },
          include: {
            event: { select: { id: true, title: true } },
            actor: { select: { id: true, name: true } }, // include actor
          },
        });

        io.to(`user_${userId}`).emit("notification", notification);
      }
    }

    res.json(newMsg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
};
