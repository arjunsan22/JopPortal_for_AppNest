import Application from '../models/Application.js';

export const submitApplication = async (req, res) => {
    try {
        const { jobId, name, email, phone, experience, currentCtc, expectedCtc, workMode } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Resume is required' });
        }
        
        const resumePath = `/public/resumes/${req.file.filename}`;
        
        const application = await Application.create({
            jobId,
            applicantName: name, 
            email,
            phone,
            experience,
            currentCtc,
            expectedCtc,
            workMode,
            resume: resumePath
        });
        
        res.status(201).json({ success: true, message: 'Application submitted successfully', application });
    } catch (error) {
        console.error('Application Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('jobId', 'title') // Populate the related Job title
            .sort({ appliedDate: -1 });

        res.status(200).json({ success: true, applications });
    } catch (error) {
        console.error('Fetching Applications Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['pending', 'selected', 'rejected'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status type' });
        }
        
        const application = await Application.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );
        
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        
        res.status(200).json({ success: true, message: 'Status updated successfully', application });
    } catch (error) {
        console.error('Status Update Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const total = await Application.countDocuments();
        const pending = await Application.countDocuments({ status: 'pending' });
        const selected = await Application.countDocuments({ status: 'selected' });
        const rejected = await Application.countDocuments({ status: 'rejected' });

        const recentApplications = await Application.find()
            .sort({ updatedAt: -1 })
            .limit(5);

        const recentActivity = recentApplications.map(app => {
            const isNew = app.createdAt.getTime() === app.updatedAt.getTime();
            return {
                id: app._id,
                action: isNew 
                    ? `New application received from ${app.applicantName}` 
                    : `${app.applicantName} - Status updated to ${app.status.charAt(0).toUpperCase() + app.status.slice(1)}`,
                time: app.updatedAt,
                type: isNew ? 'new' : 'update'
            };
        });

        res.status(200).json({
            success: true,
            stats: { total, pending, selected, rejected },
            recentActivity
        });
    } catch (error) {
        console.error('Fetching Dashboard Stats Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
