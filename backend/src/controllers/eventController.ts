import { Request, Response } from "express";
import prisma from "../prismaClient";

// Create a new event
export const createEvent = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    const { title, description, location, date } = req.body;

    if (!title || !location || !date) {
      return res
        .status(400)
        .json({ error: "Title, location, and date are required" });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        date: new Date(date),
        creatorId: req.user.userId,
      },
    });

    res.status(200).json(event);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to create event" });
  }
};

// Get all events
export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      include: { creator: true, rsvps: true },
      orderBy: { date: "asc" },
    });

    res.json(events);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};
