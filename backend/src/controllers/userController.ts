import { Request, Response } from "express";
import prisma from "../prismaClient";

export const getDashboard = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    const userId = req.user.id;

    // Events created by the user
    const myEvents = await prisma.event.findMany({
      where: { creatorId: userId },
      include: {
        rsvps: {
          include: { user: { select: { id: true, name: true } } }, // ⬅️ add this
        },
      },
      orderBy: { date: "asc" },
    });

    // Events the user RSVP'd to
    const myRsvps = await prisma.rSVP.findMany({
      where: { userId },
      include: { event: { include: { creator: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Events created by other users (exclude those already RSVP'd to)
    const otherEvents = await prisma.event.findMany({
      where: {
        creatorId: { not: userId },
        rsvps: { none: { userId } },
      },
      include: {
        creator: true,
        rsvps: {
          include: { user: { select: { id: true, name: true } } }, // ⬅️ add this
        },
      },
      orderBy: { date: "asc" },
    });

    res.json({
      user: req.user,
      myEvents,
      myRsvps,
      otherEvents,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};
