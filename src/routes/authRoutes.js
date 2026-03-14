import express from 'express';
import { login, logout, refresh } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router();

router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/refresh', refresh);

export default router;