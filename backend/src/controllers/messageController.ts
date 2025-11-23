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

    const newMsg = await prisma.message.create({
      data: {
        text,
        eventId: Number(eventId),
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // Emit to Socket.io event room
    const io = req.app.get("io");
    io.to(`event_${eventId}`).emit("receive_message", newMsg);

    res.json(newMsg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
};
