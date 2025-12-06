import { Router } from "express";
import { authenticate } from "../authMiddleware";
import { upload } from "../utils/multer";
import {
  uploadFile,
  getFiles,
  deleteFile,
  downloadEventZip,
} from "../controllers/fileController";

const router = Router();

router.get("/:eventId", authenticate, getFiles);
router.post("/:eventId", authenticate, upload.single("file"), uploadFile);
router.delete("/:fileId", authenticate, deleteFile);

router.get("/zip/:eventId", authenticate, downloadEventZip);

export default router;
