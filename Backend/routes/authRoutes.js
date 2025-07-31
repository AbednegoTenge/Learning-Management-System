import express from 'express';
import authcontroller from '../controllers/authController.js';
import authMiddleware from '../middleware/auth/middleware.js';

const router = express.Router();

router.post('/login', authMiddleware, authcontroller.login);
router.post('/register', authMiddleware, authcontroller.register);
router.post('/logout', authMiddleware, authcontroller.logout);
router.post('/refresh-token', authMiddleware, authcontroller.refreshToken);

export default router;