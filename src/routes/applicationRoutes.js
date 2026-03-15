import express from 'express';
import { submitApplication, getAllApplications, updateApplicationStatus, getDashboardStats } from '../controllers/applicationController.js';
import upload from '../utils/multer.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/apply', upload.single('resume'), submitApplication);

router.get('/stats', protect, admin, getDashboardStats);

router.get('/', protect, admin, getAllApplications);

router.put('/:id/status', protect, admin, updateApplicationStatus);

export default router;
