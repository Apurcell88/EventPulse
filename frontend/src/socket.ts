import { io } from "socket.io-client";

// This gives one persistent socket connection used anywhere in the app
// const API_URL = import.meta.env.VITE_API_URL;

export const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket"], // more stable
});
