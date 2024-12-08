import { VercelRequest, VercelResponse } from '@vercel/node';
import { ConnectMongoDB } from "../src/config/mongodb";
import setupCORS from '../src/config/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await setupCORS(req, res)
  await ConnectMongoDB();

  // API logic di sini
  res.status(200).json({ message: 'Hello from MongoDB-connected API!' });
}
