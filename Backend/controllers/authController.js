import { dblogger } from '../config/logger.js';
import Student from '../models/studentModel.js';
import Teacher from '../models/teacherModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import redisClient from '../config/redis.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/token.js';

const getModelByRole = (role) => {
    switch (role) {
        case 'student':
            return Student;
        case 'teacher':
            return Teacher;
        default:
            throw new Error('Invalid role');
    }
};

const authController = {
    async register(req, res) {
        try {
            const { name, email, password, subject, role } = req.body;
            const Model = getModelByRole(role);

            // check if student or teacher already exists
            const existingUser = await Model.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }
            // hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            // create new student or teacher
            const newUser = await Model.create({
                name,
                email,
                password: hashedPassword
            });
            dblogger.info(`New ${role} registered: Email: ${newUser.email}`);
            return res.status(201).json({ message: `${role} registered successfully`, user: newUser });
        } catch (error) {
            res.status(500).json({ message: 'Something went wrong' });
            dblogger.error(`Error during user registration: ${error.message}`, { stack: error.stack });
        }
    },

    async login(req, res) {
        try {
            const { email, password, role } = req.body;

            const Model = getModelByRole(role);
            // check if user exists
            const user = await Model.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: 'Invalid credentials' });
            }
            // check if password is correct
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            // generate access and refresh tokens
            const accessToken = generateAccessToken({ id: user.id, role: user.role });
            const refreshToken = generateRefreshToken({ id: user.id, role: user.role });
           
            const decoded = jwt.decode(refreshToken);
            const expiresAt = decoded.exp;
            const currentTime = Math.floor(Date.now() / 1000);
            const ttl = expiresAt - currentTime;

            // store refresh token in Redis
            if (ttl > 0) {
                await redisClient.set(`refresh_token:${user.id}`, refreshToken, 'EX', ttl);
            }


            // Set tokens as cookies
            res.cookie('token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 2592000000 }); // 30 days

            dblogger.info(`User logged in: Email: ${user.email}`);
        } catch (error) {
            res.status(500).json({ message: 'Something went wrong' });
            dblogger.error(`Error during user login: ${error.message}`, { stack: error.stack });
        }
    },

    async logout(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(400).json({ message: 'User not authenticated' });
            }
            // delete refresh token from redis
            await redisClient.del(`refresh_token:${userId}`);

            // clear cookies
            res.clearCookie('token');
            res.clearCookie('refreshToken');

            return res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            dblogger.error(`Error during user logout: ${error.message}`, { stack: error.stack });
            return res.status(500).json({ message: 'Something went wrong during logout' });
        }
    },

    async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ message: 'Refresh token not found' });
            }

            // verify refresh token
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const redisToken = await redisClient.get(`refresh_token:${req.user.id}`);
            if (redisToken !== refreshToken) {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }

            // generate new access token
            const newAccessToken = generateAccessToken({ id: req.user.id, role: req.user.role });
            res.cookie('token', newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });

            return res.status(200).json({ message: 'Token refreshed successfully', accessToken: newAccessToken });

        } catch (error) {
            dblogger.error(`Error during token refresh: ${error.message}`, { stack: error.stack });
            return res.status(500).json({ message: 'Something went wrong during token refresh' });
        }
    }
};

export default authController;
