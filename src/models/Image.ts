import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  webp_url: { type: String, required: true },
  jpg_url: { type: String, required: true },
  uploaded_at: { type: Date, default: Date.now },
});

export const Image = mongoose.model("Image", ImageSchema);