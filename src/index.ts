import { NowRequest, NowResponse } from '@vercel/node';
import express from "express";
import mongoose from "mongoose";
import cloudinary from "./config/cloudinary";
import { Image } from "./models/Image";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });
const router = express.Router();
router.get("/", (req, res) => {
    res.send("Levie Art");
});
  
  
app.use(router);
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "";
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

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
export default (req: NowRequest, res: NowResponse) => {
    app(req, res);
};