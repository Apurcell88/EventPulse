import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./src/routes/userRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

app.get("/api", (req, res) => {
  res.json({ message: "Backend is running!" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
