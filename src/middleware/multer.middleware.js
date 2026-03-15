/**
 * multer.middleware.js - File Upload Middleware
 *
 * ⚠️  SECURITY NOTE - Why NOT expose public file URLs?
 * ---------------------------------------------------
 * Previously, uploaded resumes were stored in `public/resumes/` and served
 * at a URL like: http://localhost:5000/public/resumes/resume-xxx.pdf
 *
 * This is DANGEROUS because:
 *  1. Anyone who guesses or brute-forces the filename can download ANY candidate's resume
 *  2. Resumes contain PII (name, phone, address, email) — violates GDPR / data privacy
 *  3. No authentication is checked before serving the static file
 *
 * PROFESSIONAL APPROACH:
 *  - Store files in a NON-public temp folder (multer's job, done here)
 *  - In production: upload to cloud storage (Cloudinary, AWS S3) and store only the secure URL
 *  - Serve resumes ONLY through an authenticated API route, not as static files
 *  - The raw filesystem path is NEVER exposed in API responses
 *
 * This middleware is placed in /middleware/ (not /utils/) because
 * multer runs as Express middleware — it belongs here architecturally.
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../utils/ApiError.js';

// Temp upload directory — NOT publicly accessible via Express static
// In production, you'd stream directly to cloud storage (e.g., Cloudinary, S3)
const uploadDir = 'temp/uploads';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Sanitize the original filename to prevent path traversal attacks
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `resume-${uniqueSuffix}${path.extname(sanitizedName)}`);
    },
});

// File filter — only allow PDF files for resumes
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Only PDF files are allowed for resumes'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter,
});

export default upload;
