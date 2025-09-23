import express from 'express';
import { login, register } from '../controllers/auth.controller.js';

const router = express.Router();

// User registration
router.post('/register', register);

// User login
router.post('/login', login);

export default router;