import express from 'express';
import { uploadMiddleware } from '../../../shared/utils/cloudinaryService.js';
import { uploadSingleMedia } from '../controllers/uploadController.js';
import { authenticate } from '../../auth/middleware/auth.js';

const router = express.Router();

// POST /api/upload/media
router.post(
  '/media',
  authenticate, // require logged‑in user; remove if you want public
  uploadMiddleware.single('file'),
  uploadSingleMedia
);

export default router;


