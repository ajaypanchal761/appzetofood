import express from 'express';
import orderRoutes from './routes/orderRoutes.js';

const router = express.Router();

router.use('/', orderRoutes);

export default router;

