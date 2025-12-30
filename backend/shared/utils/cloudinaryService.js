import multer from 'multer';
import { cloudinary } from '../../config/cloudinary.js';

// Use in‑memory storage; we stream to Cloudinary
const storage = multer.memoryStorage();

// Generic file filter for common image/video mime types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    // images
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    // videos
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Please upload an image or video.'));
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  }
});

/**
 * Upload a single buffer to Cloudinary.
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Cloudinary upload options (folder, resource_type, etc.)
 * @returns {Promise<Object>} Cloudinary upload result
 */
export function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: options.resource_type || 'auto',
        folder: options.folder || 'appzeto',
        ...options
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete a file from Cloudinary by public ID
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Cloudinary deletion result
 */
export function deleteFromCloudinary(publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
}

