import { VercelRequest, VercelResponse } from '@vercel/node';
import { IncomingForm } from 'formidable';
import mongoose from 'mongoose';
import fs from 'fs';
import sharp from 'sharp';
import streamifier from 'streamifier';
import cloudinary from '../src/config/cloudinary';
import { ConnectMongoDB } from '../src/config/mongodb';
import { Image } from '../src/models/Image';

const upload = async (req: VercelRequest, res: VercelResponse) => {
  try {
    // Pastikan koneksi MongoDB hanya dilakukan sekali
    if (mongoose.connection.readyState === 0) {
      await ConnectMongoDB();
    }

    const form: any = new IncomingForm();
    form.uploadDir = './';
    form.keepExtensions = true;

    form.parse(req, async (err: any, fields: any, files: any) => {
      if (err) {
        return res.status(400).json({ error: 'Failed to process file' });
      }

      const file = files.file[0];
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const filePath = file.filepath;
      const originalFileName = file.originalFilename;

      // Dapatkan dimensi gambar menggunakan sharp
      const { width, height } = await sharp(filePath).metadata();

      // Compress gambar dan konversi ke buffer
      const compressedImageBuffer = await sharp(filePath)
        .jpeg({ quality: 80 }) // Kompresi dengan kualitas 80 untuk jpg
        .toBuffer(); // Convert menjadi buffer

      // Tentukan public_id berdasarkan nama file
      const publicId = originalFileName.split('.')[0];

      // Upload gambar terkompresi ke Cloudinary menggunakan upload_stream untuk JPG
      const uploadStreamJPG = cloudinary.uploader.upload_stream(
        {
          format: 'jpg', // Format gambar untuk JPG
          public_id: publicId + '_jpg',
        },
        async (error, result) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }

          // Upload gambar terkompresi ke Cloudinary menggunakan upload_stream untuk WebP
          const uploadStreamWebP = cloudinary.uploader.upload_stream(
            {
              format: 'webp', // Format gambar untuk WebP
              public_id: publicId + '_webp',
            },
            async (error, result: any) => {
              if (error) {
                return res.status(500).json({ error: error.message });
              }

              // Simpan URL gambar yang diupload di MongoDB
              const newImage = new Image({
                title,
                webp_url: result.secure_url,
                jpg_url: result.secure_url, // Anda bisa mengganti jika menggunakan format lain
                width,
                height,
              });

              await newImage.save();

              // Clean up temporary file
              fs.unlinkSync(filePath);

              res.status(200).json({
                message: 'Image uploaded successfully',
                data: newImage,
              });
            }
          );

          // Mengubah buffer menjadi stream untuk WebP
          streamifier.createReadStream(compressedImageBuffer).pipe(uploadStreamWebP);
        }
      );

      // Mengubah buffer menjadi stream untuk JPG
      streamifier.createReadStream(compressedImageBuffer).pipe(uploadStreamJPG);
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export default upload;
