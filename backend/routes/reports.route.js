import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { downloadReport, generateReport, getSession } from '../controllers/report.controller.js';

const router = express.Router();

// Generate PDF report
router.post('/generate-report', authenticateToken, generateReport);

// Download generated report
router.get('/download/:fileName', downloadReport);

// Get available sessions
router.get('/sessions', authenticateToken, getSession);

export default router;