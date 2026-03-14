import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({ message: 'Not authenticated, Login pls' });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'fallback_access_secret');
        
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        if (error.name === 'TokenExpiredError') {
             return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
}

//admin.......
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'You Not An Admin' });
    }
}