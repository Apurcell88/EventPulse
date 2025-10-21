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
          userId: req.user.userId,
          eventId: Number(eventId),
        },
      },
      update: { status },
      create: {
        userId: req.user.userId,
        eventId: Number(eventId),
        status,
      },
      include: {
        event: { include: { creator: true } }, // return event details
      },
    });

    res.json(rsvp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to RSVP" });
  }
};
