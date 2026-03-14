
import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    requirements: {
        type: [String],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
        required: true
    },
    workMode: {
        type: String,
        enum: ['Remote', 'Work From Office', 'Hybrid'],
        required: true
    },

    salary: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    status: {
        type: String,
        enum: ['Active', 'Closed'],
        default: 'Active'
    }
},
    {
        timestamps: true
    }
);

const Job = mongoose.model('Job', jobSchema);

export default Job;