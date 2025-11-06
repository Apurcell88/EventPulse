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
        creatorId: req.user.id,
      },
      include: { creator: true },
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

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: Number(id) },
      include: { creator: true, rsvps: true },
    });

    if (!event) return res.status(404).json({ error: "Event not found" });

    res.json(event);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch event" });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    const { id } = req.params;
    const { title, description, location, date } = req.body;

    const event = await prisma.event.findUnique({ where: { id: Number(id) } });
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.creatorId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updated = await prisma.event.update({
      where: { id: Number(id) },
      data: { title, description, location, date: new Date(date) },
    });

    res.json(updated);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to update event" });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = req.user.id;

    // if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    const { id } = req.params;

    // Delete RSVPs tied to this event
    await prisma.rSVP.deleteMany({
      where: { eventId: Number(id) },
    });

    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.creatorId !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this event" });
    }

    await prisma.event.delete({ where: { id: eventId } });

    res.json({ message: "Event deleted successfully" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete event" });
  }
};
