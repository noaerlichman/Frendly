import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dcomxqifs',
  api_key: '657715479229442',
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary; 