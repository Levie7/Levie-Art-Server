import { VercelRequest, VercelResponse } from '@vercel/node';
import { ConnectMongoDB } from "../src/config/mongodb";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  await ConnectMongoDB();

  // API logic di sini
  res.status(200).json({ message: 'Hello from MongoDB-connected API!' });
}
