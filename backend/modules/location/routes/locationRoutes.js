import express from 'express';
import { reverseGeocode } from '../controllers/locationController.js';

const router = express.Router();

// Reverse geocode coordinates to address
router.get('/reverse', reverseGeocode);

export default router;

