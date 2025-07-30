import { dblogger } from '../config/logger.js';
import Student from '../../../models/studentModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import redisClient from '../../../config/redis.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/token.js';

const authController = {
    async register(req, res) {
        try {
            const { firstName, middleName, lastName, email, password, gender, dateofBirth } = req.body;
            // Combine lastname, middlename, and firstname as name
            const name = `${lastName} ${middleName} ${firstName}`;

            // Password strength validation
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({ message: 'Password must be at least 8 characters long and contain a letter and a number' });
            }

            // Check if student already exists
            const student = await Student.findOne({ where: { email } });
            if (student) {
                return res.status(400).json({ message: 'Student already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create student
            const newStudent = await Student.create({
                firstName, 
                middleName, 
                lastName, 
                name, 
                email, 
                password: hashedPassword, 
                gender, 
                dateofBirth
            });

            // Remove password from response object
            const { password: _, ...studentResponse } = newStudent.toJSON();

            // Log the action
            dblogger.info(`Student created: Name: ${newStudent.name}, Action: create`);

            res.status(201).json(studentResponse);
        } catch (error) {
            res.status(500).json({ message: 'Something went wrong' });
            dblogger.error(`Error during student registration: ${error.message}`, { stack: error.stack });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Check if student exists
            const student = await Student.findOne({ where: { email } });
            if (!student) {
                return res.status(404).json({ message: 'Invalid Credentials' });
            }

            // Check if password is correct
            const isPasswordValid = await bcrypt.compare(password, student.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid Credentials' });
            }
            // Generate access and refresh tokens
            const accessToken = generateAccessToken({ id: student.id, email: student.email });
            const refreshToken = generateRefreshToken({ id: student.id, email: student.email });

            const decoded = jwt.decode(refreshToken);
            const expiresAt = decoded.exp;
            const currentTime = Math.floor(Date.now() / 1000);
            const ttl = expiresAt - currentTime;

            // Optionally store refresh token in Redis
            await redisClient.set(`refresh_token:${student.id}`, refreshToken, 'EX', ttl > 0 ? ttl : 0);

            // Set tokens as cookies
            res.cookie('token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 2592000000 }); // 30 days

            dblogger.info(`Student logged in: Email: ${student.email}`);
        } catch (error) {
            res.status(500).json({ message: 'Something went wrong' });
            dblogger.error(`Error during student login: ${error.message}`, { stack: error.stack });
        }
    }
};

export default authController;
