import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  webp_url: { type: String, required: true },
  jpg_url: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  uploaded_at: { type: Date, default: Date.now },
});

export const Image = mongoose.model("Image", ImageSchema);