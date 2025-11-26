import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import prisma from "./src/prismaClient";
import { createServer } from "http";
import { Server } from "socket.io";
// import userRoutes from "./src/routes/userRoutes";
import authRoutes from "./src/routes/authRoutes";
import userRoutes from "./src/routes/userRoutes";
import eventRoutes from "./src/routes/eventRoutes";
import rsvpRoutes from "./src/routes/rsvpRoutes";
import messageRoutes from "./src/routes/messageRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// User routes
app.use("/api/users", userRoutes);

app.get("/api", (req, res) => {
  res.json({ message: "Backend is running!" });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Event routes
app.use("/api/events", eventRoutes);

// RSVP routes
app.use("/api/rsvps", rsvpRoutes);

// Message routes
app.use("/api/messages", messageRoutes);

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Create HTTP wrapper
const httpServer = createServer(app);

// Create IO server
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Allow controllers to access io
app.set("io", io);

// Listen for connections
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins a specific event room
  socket.on("join_event", (eventId) => {
    socket.join(`event_${eventId}`);
  });

  // NEW - typing started
  socket.on("typing_start", ({ eventId, user }) => {
    socket.to(`event_${eventId}`).emit("typing_start", { user });
  });

  // NEW - typing stopped
  socket.on("typing_stop", ({ eventId, user }) => {
    socket.to(`event_${eventId}`).emit("typing_stop", { user });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
