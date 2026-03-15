import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!token && !refreshToken) {
        return res.status(401).json({ message: 'Not authenticated, Login pls' });
    }

    try {
        if (token) {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'fallback_access_secret');
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }
            return next();
        }
    } catch (error) {
        // If token is invalid (not just expired), immediately reject
        if (error.name !== 'TokenExpiredError') {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // Token is either missing (but refresh token exists) OR expired. Attempt refresh:
    if (refreshToken) {
        try {
            const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret');
            req.user = await User.findById(decodedRefresh.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Immediately issue and attach a fresh access token
            const newAccessToken = jwt.sign(
                { id: req.user._id, role: req.user.role },
                process.env.ACCESS_TOKEN_SECRET || 'fallback_access_secret',
                { expiresIn: '15m' }
            );

            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax', // Must match login setup
                maxAge: 15 * 60 * 1000 // 15 minutes
            });

            return next();
        } catch (refreshError) {
            console.error('Refresh token failed:', refreshError);
            return res.status(401).json({ message: 'Session expired, please login again' });
        }
    }

    return res.status(401).json({ message: 'Not authenticated, Login pls' });
}

//admin.......
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'You Not An Admin' });
    }
}