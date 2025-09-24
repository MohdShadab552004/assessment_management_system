import express from 'express';
import { login, register, me, logout } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { registerValidation, loginValidation } from '../validation/auth.validation.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

router.get('/me', authenticateToken, me);
router.post('/logout', authenticateToken, logout);

export default router;