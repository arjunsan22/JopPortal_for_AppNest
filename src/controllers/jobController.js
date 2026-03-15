import Job from '../models/Job.js';
import { getPaginationOptions, createPaginatedResponse } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';


export const createJob = asyncHandler(async (req, res) => {
    req.body.postedBy = req.user._id;
    const job = await Job.create(req.body);

    return res.status(201).json(new ApiResponse(201, { job }, 'Job created successfully'));
});


export const getAllJobs = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationOptions(req);
    const { search, location } = req.query;

    const filter = {};

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { company: { $regex: search, $options: 'i' } }
        ];
    }

    if (location) {
        filter.location = { $regex: location, $options: 'i' };
    }

    const totalDocuments = await Job.countDocuments(filter);
    
    const jobs = await Job.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const paginatedResponse = createPaginatedResponse(jobs, totalDocuments, page, limit);

    return res.status(200).json(new ApiResponse(200, paginatedResponse, 'Jobs fetched successfully'));
});


export const getJobById = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        throw new ApiError(404, 'Job not found');
    }

    return res.status(200).json(new ApiResponse(200, { job }, 'Job fetched successfully'));
});



export const updateJob = asyncHandler(async(req, res)=>{
            const {title, company, description, requirements, location, jobType, workMode, salary, experience, status} = req.body;
            
            const allowedUpdates = {title, company, description, requirements, location, jobType, workMode, salary, experience, status};

            Object.keys(allowedUpdates).forEach(key=> allowedUpdates[key] === undefined && delete allowedUpdates[key]);

            const job = await Job.findByIdAndUpdate(req.params.id, allowedUpdates, {new: true});

            if(!job){
                throw new ApiError(404, 'Job not found');
            }
            return res.status(200).json(new ApiResponse(200, {job}, 'Job updated successfully'));

            
})

export const deleteJob = asyncHandler(async (req, res) => {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
        throw new ApiError(404, 'Job not found');
    }

    return res.status(200).json(new ApiResponse(200, { job }, 'Job deleted successfully'));
});