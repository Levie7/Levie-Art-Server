import express from "express";
import cloudinary from "./config/cloudinary";
import { ConnectMongoDB } from "./config/mongodb";
import { Image } from "./models/Image";
import multer from "multer";
import cors from "cors";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

ConnectMongoDB()

// Upload Endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file?.path || "";

    // Upload ke Cloudinary
    const resultWebP = await cloudinary.uploader.upload(filePath, {
      format: "webp",
    });
    const resultJPG = await cloudinary.uploader.upload(filePath, {
      format: "jpg",
    });

    // Simpan ke MongoDB
    const newImage = new Image({
      webp_url: resultWebP.secure_url,
      jpg_url: resultJPG.secure_url,
    });
    await newImage.save();

    res.json(newImage);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5001, () => console.log("Server running on http://localhost:5001"));
