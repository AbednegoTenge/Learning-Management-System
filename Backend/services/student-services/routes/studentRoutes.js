import express from 'express';
import authcontroller from '../controllers/studentController.js';
import authMiddleware from '../../../middleware/auth/middleware.js';

const router = express.Router();

router.post('/login', authMiddleware, authcontroller.login);
router.post('/register', authMiddleware, authcontroller.register);