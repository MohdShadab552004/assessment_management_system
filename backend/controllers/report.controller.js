import path from 'path';
import fs from 'fs';
import { assessmentData } from '../data/sampleData.js';
import { assessmentConfigs } from '../config/reportConfig.js';
import { PDFGenerator } from '../service/pdfGenerator.service.js';
import { validationResult } from 'express-validator';

const pdfGenerator = new PDFGenerator();

export const generateReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { session_id } = req.body;
    if (!session_id) {
      return res.status(400).json({ error: 'session_id is required' });
    }

    // Find assessment data
    const assessment = assessmentData.find(data => data.session_id === session_id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment data not found for the given session_id' });
    }

    // Get configuration for this assessment type
    const config = assessmentConfigs[assessment.assessment_id];
    if (!config) {
      return res.status(404).json({ error: `No configuration found for assessment type: ${assessment.assessment_id}` });
    }

    // Generate PDF
    const result = await pdfGenerator.generatePDF(assessment, config);

    res.json({
      success: true,
      message: 'PDF report generated successfully',
      session_id: assessment.session_id,
      assessment_id: assessment.assessment_id,
      file_name: result.fileName,
      download_url: `/api/reports/download/${result.fileName}`
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
}

export const downloadReport = (req, res) => {
  try {
    const fileName = req.params.fileName;
    
    if (!fileName) {
      return res.status(400).json({ error: 'File name is required' });
    }

    // Security check: ensure fileName is safe
    if (fileName.includes('..') || !fileName.startsWith('report_')) {
      return res.status(400).json({ error: 'Invalid file name' });
    }

    const filePath = path.join(pdfGenerator.outputDir, fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set proper headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
}

export const getSession = (req, res) => {
  const sessions = assessmentData.map(data => ({
    session_id: data.session_id,
    assessment_id: data.assessment_id,
    timestamp: data.timestamp,
    accuracy: data.accuracy
  }));
  
  return res.json(sessions);
}