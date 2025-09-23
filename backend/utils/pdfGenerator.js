import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { getDataByPath, classifyValue } from '../config/reportConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class PDFGenerator {
  constructor() {
    this.outputDir = join(__dirname, '../generated-reports');
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  generateHTMLReport(assessmentData, config) {

    const timestamp = new Date().toLocaleString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Calculate overall score
    const overallScore = assessmentData.accuracy || assessmentData.vitalsMap?.wellness_score || 'N/A';
    const scoreColor = overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#f59e0b' : '#ef4444';

    const sectionsHTML = config.sections.map(section => {
      const fieldsHTML = section.fields.map(field => {
        const value = getDataByPath(assessmentData, field.data_path);
        const classification = classifyValue(value, field.classification);
        
        let displayValue = 'N/A';
        if (value !== null && value !== undefined) {
          if (field.format === 'percentage') {
            displayValue = `${parseFloat(value).toFixed(1)}%`;
          } else if (field.unit) {
            displayValue = `${value} ${field.unit}`;
          } else {
            displayValue = value.toString();
          }
        }
        
        const classificationHTML = classification ? 
          `<span class="classification" style="background-color: ${classification.color}">${classification.label}</span>` : '';

        return `
          <div class="field-card">
            <div class="field-header">
              <span class="field-label">${field.label}</span>
              ${classificationHTML}
            </div>
            <div class="field-value">${displayValue}</div>
          </div>
        `;
      }).join('');

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-icon">📊</div>
            <h2 class="section-title">${section.title}</h2>
          </div>
          <div class="fields-grid">
            ${fieldsHTML}
          </div>
        </div>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${config.report_title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 40px 20px;
            min-height: 100vh;
        }
        
        .report-container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        /* Header Styles */
        .report-header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
        }
        
        .header-content {
            position: relative;
            z-index: 2;
        }
        
        .report-title {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        
        .report-subtitle {
            font-size: 16px;
            font-weight: 400;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        
        .score-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 15px 30px;
            border-radius: 50px;
            font-size: 24px;
            font-weight: 700;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .header-pattern {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            opacity: 0.1;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="white"/></svg>');
        }
        
        /* Patient Info */
        .patient-info {
            background: #f8fafc;
            padding: 30px 40px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
        }
        
        .info-label {
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        
        .info-value {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
        }
        
        /* Sections */
        .sections-container {
            padding: 40px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section-header {
            display: flex;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f1f5f9;
        }
        
        .section-icon {
            font-size: 24px;
            margin-right: 15px;
        }
        
        .section-title {
            font-size: 22px;
            font-weight: 700;
            color: #1e293b;
            margin: 0;
        }
        
        .fields-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .field-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        
        .field-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            border-color: #c7d2fe;
        }
        
        .field-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .field-label {
            font-size: 14px;
            font-weight: 600;
            color: #475569;
            flex: 1;
        }
        
        .classification {
            padding: 4px 12px;
            border-radius: 20px;
            color: white;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .field-value {
            font-size: 24px;
            font-weight: 700;
            color: #1e293b;
        }
        
        /* Footer */
        .report-footer {
            background: #1e293b;
            color: white;
            padding: 30px 40px;
            text-align: center;
        }
        
        .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .footer-logo {
            font-size: 18px;
            font-weight: 700;
        }
        
        .footer-info {
            font-size: 12px;
            opacity: 0.8;
        }
        
        .timestamp {
            font-size: 12px;
            opacity: 0.7;
        }
        
        /* Print Styles */
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .report-container {
                box-shadow: none;
                border-radius: 0;
            }
            .field-card:hover {
                transform: none;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            body {
                padding: 20px 10px;
            }
            .report-header {
                padding: 30px 20px;
            }
            .sections-container {
                padding: 30px 20px;
            }
            .fields-grid {
                grid-template-columns: 1fr;
            }
            .footer-content {
                flex-direction: column;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <!-- Header -->
        <div class="report-header">
            <div class="header-pattern"></div>
            <div class="header-content">
                <h1 class="report-title">${config.report_title}</h1>
                <p class="report-subtitle">Comprehensive Health Assessment Report</p>
                <div class="score-badge" style="color: ${scoreColor}">
                    Overall Score: ${overallScore}${typeof overallScore === 'number' ? '%' : ''}
                </div>
            </div>
        </div>
        
        <!-- Patient Information -->
        <div class="patient-info">
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Session ID</span>
                    <span class="info-value">${assessmentData.session_id}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Assessment Type</span>
                    <span class="info-value">${assessmentData.assessment_id}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Patient Gender</span>
                    <span class="info-value">${assessmentData.gender || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Assessment Date</span>
                    <span class="info-value">${new Date(assessmentData.timestamp).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
        
        <!-- Assessment Sections -->
        <div class="sections-container">
            ${sectionsHTML}
        </div>
        
        <!-- Footer -->
        <div class="report-footer">
            <div class="footer-content">
                <div class="footer-logo">HealthPro Analytics</div>
                <div class="footer-info">
                    This report was generated automatically by our assessment system.<br>
                    For any questions, please contact our support team.
                </div>
                <div class="timestamp">
                    Generated on: ${timestamp}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  async generatePDF(assessmentData, config) {
  let browser;
  try {
    const fileName = `report_${assessmentData.session_id}.pdf`;
    const filePath = join(this.outputDir, fileName);

    //  Check if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`PDF already exists: ${filePath}`);
      return { filePath, fileName }; 
    }

    // Otherwise create new PDF
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    const htmlContent = this.generateHTMLReport(assessmentData, config);

    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    await page.evaluateHandle("document.fonts.ready");
    await page.waitForTimeout(1000);

    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
    });

    console.log(`PDF generated successfully: ${filePath}`);
    return { filePath, fileName };
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
}