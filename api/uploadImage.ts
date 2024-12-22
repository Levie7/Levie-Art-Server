import { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import mongoose from 'mongoose';
import sharp from 'sharp';
import streamifier from 'streamifier';
import cloudinary from '../src/config/cloudinary';
import { ConnectMongoDB } from '../src/config/mongodb';
import { Image } from '../src/models/Image';
import setupCORS from '../src/config/cors';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Adjust the size limit as necessary (e.g., 10MB, 20MB)
    },
  },
};

const uploadImage = async (req: VercelRequest, res: VercelResponse) => {
  try {
    // Pastikan koneksi MongoDB hanya dilakukan sekali
    await setupCORS(req, res)
    if (mongoose.connection.readyState === 0) {
      await ConnectMongoDB();
    }

    // Konfigurasi Formidable
    const form = formidable();

    form.parse(req, async (err: any, fields: any, files: any) => {
      if (err) {
        return res.status(400).json({ error: 'Failed to process file' });
      }

      const file = files.file[0] as formidable.File;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      // Baca file dari buffer
      const fileBuffer = await sharp(file.filepath).toBuffer();
      
      // Dapatkan dimensi gambar menggunakan sharp
      const { width, height } = await sharp(fileBuffer).metadata();
      
      // Kompres gambar menjadi JPG dan WebP
      const compressedBufferJPG = await sharp(fileBuffer)
        .jpeg({ quality: 80 })
        .toBuffer();
      const compressedBufferWebP = await sharp(fileBuffer)
        .webp({ quality: 80 })
        .toBuffer();

      // Tentukan public_id berdasarkan nama file
      const publicId = file.originalFilename?.split('.')[0] || 'untitled';

      // Upload ke Cloudinary untuk JPG
      const resultJPG = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { format: 'jpg', public_id: `${publicId}_jpg` },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          streamifier.createReadStream(compressedBufferJPG).pipe(uploadStream);
      });

      // Upload ke Cloudinary untuk WebP
      const resultWebP = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { format: 'webp', public_id: `${publicId}_webp` },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          streamifier.createReadStream(compressedBufferWebP).pipe(uploadStream);
      });

      // Simpan data ke MongoDB
      const newImage = new Image({
        title,
        webp_url: (resultWebP as any).secure_url,
        jpg_url: (resultJPG as any).secure_url,
        width,
        height,
      });

      await newImage.save();

      res.status(200).json({
        message: 'Image uploaded successfully',
        data: newImage,
      });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export default uploadImage;
