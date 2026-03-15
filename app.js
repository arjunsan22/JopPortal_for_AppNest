import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//user and auth routes
import authRoutes from './src/routes/authRoutes.js'
import jobRoutes from './src/routes/jobRoutes.js'
import applicationRoutes from './src/routes/applicationRoutes.js'

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//static files
app.use('/public/images',express.static(path.join(__dirname,'public/images')));
app.use('/public/resumes',express.static(path.join(__dirname,'public/resumes')));

//API routes

app.use('/api/auth', authRoutes)
app.use('/api/job', jobRoutes)
app.use('/api/applications', applicationRoutes)

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' })
});

export default app;