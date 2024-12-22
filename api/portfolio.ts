import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import setupCORS from '../src/config/cors';
import { ConnectMongoDB } from '../src/config/mongodb';
import { Image } from '../src/models/Image';

const portfolio = async (req: VercelRequest, res: VercelResponse) => {
    try {
      // Pastikan koneksi MongoDB hanya dilakukan sekali
      await setupCORS(req, res)
      if (mongoose.connection.readyState === 0) {
        await ConnectMongoDB();
      }
  
      const items = await Image.find().sort({ uploaded_at: -1 });; 
      res.status(200).json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export default portfolio;
  