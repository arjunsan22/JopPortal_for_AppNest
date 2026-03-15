
import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    jobId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Job',
        required:true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:false
    },
    applicantName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    experience:{
        type:String,
        required:true
    },
    currentCtc:{
        type:String,
        default:''
    },
    expectedCtc:{
        type:String,
        required:true
    },
    workMode:{
        type:String,
        enum:['Remote','Work From Office','Hybrid'],
        required:true
    },
    resume:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:['pending','selected','rejected'],
        default:'pending'
    },
    appliedDate:{
        type:Date,
        default:Date.now
    }
},{
    timestamps:true
})


const Application = mongoose.model('Application',applicationSchema);

export default Application;