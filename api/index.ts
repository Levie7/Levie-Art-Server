import { VercelRequest, VercelResponse } from '@vercel/node';
import express from "express";
import { ConnectMongoDB } from "../src/config/mongodb";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

ConnectMongoDB()

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ message: 'This is the index endpoint!' });
}
