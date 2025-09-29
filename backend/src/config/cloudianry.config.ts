import { Provider } from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';

export const CLOUDINARY = 'CLOUDINARY';

export const CloudinaryProvider: Provider = {
  provide: CLOUDINARY,
  useFactory: () => {
    Cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!, // 'dyscafqap'
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
      secure: true,
    });
    return Cloudinary;
  },
};
