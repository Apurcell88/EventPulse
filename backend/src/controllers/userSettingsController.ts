import { Request, Response } from "express";
import prisma from "../prismaClient";

export const getNotificationSettings = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        notifyMessages: true,
        notifyFiles: true,
        notifyRsvps: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load settings" });
  }
};

export const updateNotificationSettings = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not Authenticated" });

    const { notifyMessages, notifyFiles, notifyRsvps } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        notifyMessages: !!notifyMessages, // !! This is a quick way to force any value into a boolean. !value -> converts to boolean and negates it. !!values -> negates twice -> boolean version of the original value
        notifyFiles: !!notifyFiles,
        notifyRsvps: !!notifyRsvps,
      },
      select: {
        notifyMessages: true,
        notifyFiles: true,
        notifyRsvps: true,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update settings" });
  }
};
