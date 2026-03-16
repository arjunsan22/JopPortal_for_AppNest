import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';


export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'Email and password are required');
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(401, 'Invalid credentials');
    }



    const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET || 'fallback_access_secret',
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret',
        { expiresIn: '7d' }
    );

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json(
        new ApiResponse(200, { id: user._id, email: user.email, role: user.role }, 'Logged in successfully')
    );
});


export const logout = asyncHandler(async (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json(new ApiResponse(200, {}, 'Logged out successfully'));
});


