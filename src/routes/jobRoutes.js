import express from 'express';
import { createJob, getAllJobs, getJobById, updateJob, deleteJob } from '../controllers/jobController.js';
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router();

router.get('/', getAllJobs);
router.get('/:id', getJobById);
router.post('/', protect, admin, createJob);
router.put('/:id', protect, admin, updateJob);
router.delete('/:id', protect, admin, deleteJob);

export default router;