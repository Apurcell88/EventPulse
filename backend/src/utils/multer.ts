import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";

export const upload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: async (req: any, file: any) => {
      const eventId = req.params.eventId || "Unknown";

      return {
        folder: `eventpulse/events/${eventId}`, // <- per-event folder
        resource_type: "auto",
        // format: undefined, // let Cloudinary detect file type
        // public_id: undefined, // let Cloudinary assign unique ID
      };
    },
  }),
});
