import { Request, Response } from "express";
import prisma from "../prismaClient";

// Create or update RSVP
export const rsvpEvent = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    const { eventId, status } = req.body;

    if (!eventId || !status) {
      return res.status(400).json({ error: "eventId and status are required" });
    }

    const rsvp = await prisma.rSVP.upsert({
      where: {
        userId_eventId: {
          userId: req.user.id,
          eventId: Number(eventId),
        },
      },
      update: { status },
      create: {
        userId: req.user.id,
        eventId: Number(eventId),
        status,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: true,
      },
    });

    // Socket.IO broadcast
    const io = req.app.get("io");
    console.log("Emitting rsvpUpdated");
    if (io) {
      io.emit("rsvpUpdated", {
        eventId: Number(eventId),
        userId: req.user.id,
        status,
        user: rsvp.user,
      });
    }

    res.json(rsvp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to RSVP" });
  }
};
