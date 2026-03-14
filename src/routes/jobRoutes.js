import express from 'express';
import { createJob, getAllJobs, getJobById } from '../controllers/jobController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router();

router.get('/', getAllJobs);
router.get('/:id', getJobById);
router.post('/', protect, admin, createJob);

export default router;