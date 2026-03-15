import mongoose from 'mongoose';
import Application from '../models/Application.js';
import path from 'path';
import fs from 'fs';
import { getPaginationOptions, createPaginatedResponse } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';


export const submitApplication = asyncHandler(async (req, res) => {
    const { jobId, name, email, phone, experience, currentCtc, expectedCtc, workMode } = req.body;

    if (!req.file) {
        throw new ApiError(400, 'Resume (PDF) is required');
    }


    const resumeFilename = req.file.filename;

    const application = await Application.create({
        jobId,
        applicantName: name,
        email,
        phone,
        experience,
        currentCtc,
        expectedCtc,
        workMode,
        resume: resumeFilename,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, { applicationId: application._id }, 'Application submitted successfully'));
});


export const getAllApplications = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationOptions(req);
    const { search, status } = req.query;

    const filter = {};

    if (status && status !== 'all') {
        filter.status = status;
    }

    if (search) {
        filter.$or = [
            { applicantName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },

        ];
    }

    const totalDocuments = await Application.countDocuments(filter);

    const applications = await Application.find(filter)
        .populate('jobId', 'title')
        .sort({ appliedDate: -1 })
        .skip(skip)
        .limit(limit);


    const paginatedResponse = createPaginatedResponse(applications, totalDocuments, page, limit);

    return res
        .status(200)
        .json(new ApiResponse(200, paginatedResponse, 'Applications fetched successfully'));
});


export const getAppliedJobs = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationOptions(req);
    const { phone, search } = req.query;

    if (!phone) {
        throw new ApiError(400, 'Phone number is required');
    }

    const filter = { phone };

    if (search) {
        const Job = mongoose.model('Job');
        const matchingJobs = await Job.find({
            title: { $regex: search, $options: 'i' }
        }).select('_id');
        
        const jobIds = matchingJobs.map(job => job._id);
        filter.jobId = { $in: jobIds };
    }

    const totalDocuments = await Application.countDocuments(filter);

    const applications = await Application.find(filter)
        .populate('jobId', 'title company location')
        .sort({ appliedDate: -1 })
        .skip(skip)
        .limit(limit);

    const paginatedResponse = createPaginatedResponse(applications, totalDocuments, page, limit);

    return res
        .status(200)
        .json(new ApiResponse(200, paginatedResponse, 'Applied jobs fetched successfully'));
});



export const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'selected', 'rejected'];

    if (!validStatuses.includes(status)) {
        throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const application = await Application.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
    );

    if (!application) {
        throw new ApiError(404, 'Application not found');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { application }, 'Application status updated successfully'));
});


export const getDashboardStats = asyncHandler(async (req, res) => {
    const [total, pending, selected, rejected, recentApplications] = await Promise.all([
        Application.countDocuments(),
        Application.countDocuments({ status: 'pending' }),
        Application.countDocuments({ status: 'selected' }),
        Application.countDocuments({ status: 'rejected' }),
        Application.find().sort({ updatedAt: -1 }).limit(5),
    ]);

    const recentActivity = recentApplications.map((app) => {
        const isNew = app.createdAt.getTime() === app.updatedAt.getTime();
        return {
            id: app._id,
            action: isNew
                ? `New application received from ${app.applicantName}`
                : `${app.applicantName} - Status updated to ${app.status.charAt(0).toUpperCase() + app.status.slice(1)}`,
            time: app.updatedAt,
            type: isNew ? 'new' : 'update',
        };
    });

    return res.status(200).json(
        new ApiResponse(200, { stats: { total, pending, selected, rejected }, recentActivity }, 'Dashboard stats fetched successfully')
    );
});

export const downloadResume = asyncHandler(async (req, res) => {
    const { filename } = req.params;

    const sanitizedFilename = path.basename(filename);

    const filePath = path.resolve('temp', 'uploads', sanitizedFilename);

    if (!fs.existsSync(filePath)) {
        throw new ApiError(404, 'Resume file not found');
    }

    res.download(filePath, sanitizedFilename, (err) => {
        if (err) {
            console.error("Error downloading file", err);
        }
    });
});
