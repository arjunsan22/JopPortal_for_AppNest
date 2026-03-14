import bcrypt from 'bcrypt'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
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
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            message: 'Logged in successfully',
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.json({ success: true, message: 'logout successfully' });
    } catch (error) {
        console.error('logout error', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'Refresh token not found' });
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret', (err, decoded) => {
            if (err) {
                return res.status(403).json({ success: false, message: 'Invalid refresh token' });
            }

            const accessToken = jwt.sign(
                { id: decoded.id, role: 'admin' },
                process.env.ACCESS_TOKEN_SECRET || 'fallback_access_secret',
                { expiresIn: '15m' }
            );

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000
            });

            res.json({ success: true, message: 'Token refreshed successfully' });
        });

    } catch (error) {
        console.error('refresh error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};