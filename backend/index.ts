import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
// import userRoutes from "./src/routes/userRoutes";
import authRoutes from "./src/routes/authRoutes";
import userRoutes from "./src/routes/userRoutes";

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
