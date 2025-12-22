// User module - to be implemented
import express from 'express';

const router = express.Router();

// Placeholder route
router.get('/', (req, res) => {
  res.status(501).json({ message: 'User module not implemented yet' });
});

export default router;

