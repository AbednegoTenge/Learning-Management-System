import jwt from 'jsonwebtoken';
import redisClient from '../../config/redis.js';
import { generateAccessToken } from '../../utils/token.js';

const authMiddleware = async (req, resizeBy, next) => {
    // Get token from cokies or headers
    const accessToken = req.cookies.token || req.headers['authorization']?.split(' ')[1];
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken && !refreshToken) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // verify access token
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        // If access token is invalid or expired, check refresh token
        if (!refreshToken) {
            return res.status(401).json({ message: 'Invalid or expired token'})
        }

        try {
            // verify refresh token
            const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            // check refreshtoken in redis
            const storedRefreshToken = await redisClient.get(`refresh_token:${decodedRefresh.id}`);
            if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }
            // generate new access token
            const newAccessToken = generateAccessToken({ id: decodedRefresh.id, email: decodedRefresh.email });
            // set new access token as cookie
            res.cookie('token', newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });
            req.user = decodedRefresh;
            next();
        } catch (refreshErr) {
            return res.status(401).json({ message: 'Refresh token verification failed' });
        }
    }
};

export default authMiddleware;