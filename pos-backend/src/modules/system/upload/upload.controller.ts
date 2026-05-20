import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { handleError } from "../../../utils/errorHandler.js";

const uploadController = {
  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      const { image } = req.body;
      if (!image) {
        res.status(400).json({ success: false, message: "No image data provided" });
        return;
      }

      const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!matches) {
        res.status(400).json({ success: false, message: "Invalid image format. Expected base64 data URL." });
        return;
      }

      const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
      const data = matches[2];
      const buffer = Buffer.from(data, "base64");

      const uploadsDir = "./uploads";
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `${uuidv4()}.${ext}`;
      const filepath = path.join(uploadsDir, filename);

      await fs.promises.writeFile(filepath, buffer);

      const url = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
      res.status(200).json({ success: true, url });
    } catch (error) {
      handleError(res, error as any, "uploadController.uploadImage");
    }
  }
};

export default uploadController;
