import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const LOCAL_FE = process.env.LOCAL_FE || "";
const PROD_FE = process.env.PROD_FE || "";

// Middleware helper for CORS
const corsMiddleware = cors({
  origin: [LOCAL_FE, PROD_FE],
  methods: ['GET', 'POST'], // HTTP methods yang diizinkan
  allowedHeaders: ['Content-Type'], // Header yang diizinkan
});

function runMiddleware(req: VercelRequest, res: VercelResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Endpoint handler
export default async function setupCORS(req: VercelRequest, res: VercelResponse) {
  try {
    // Jalankan middleware CORS
    await runMiddleware(req, res, corsMiddleware);

    console.log("CORS setup success!");
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
