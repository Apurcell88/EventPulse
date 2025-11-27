import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "eventpulse/files",
    resource_type: "auto",
  } as {
    folder: string;
    resource_type: string;
  },
});

export const upload = multer({ storage });
