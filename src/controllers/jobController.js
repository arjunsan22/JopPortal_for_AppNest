
import Job from '../models/Job.js';

export const createJob = async (req, res) => {
    try {
        console.log(req.body)
        req.body.postedBy = req.user._id;
        const job = await Job.create(req.body);
        res.status(201).json({ success: true, message: 'Job created', job });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getAllJobs = async (req, res) => {
    try {
        // Find all active jobs, sorted by newest first
        const jobs = await Job.find({ status: 'Active' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: jobs.length, jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        res.status(200).json({ success: true, job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}