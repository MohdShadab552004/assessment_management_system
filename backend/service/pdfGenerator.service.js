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

  // Dynamic data extraction methods
  extractPatientInfo(assessmentData) {
    return {
      sessionId: assessmentData.session_id,
      assessmentType: assessmentData.assessment_id,
      gender: assessmentData.gender || 'N/A',
      age: assessmentData.vitalsMap?.metadata?.physiological_scores?.dob 
        ? this.calculateAge(assessmentData.vitalsMap.metadata.physiological_scores.dob)
        : assessmentData.bodyCompositionData?.Age || 'N/A',
      height: assessmentData.height || assessmentData.vitalsMap?.metadata?.physiological_scores?.height || 'N/A',
      weight: assessmentData.weight || assessmentData.vitalsMap?.metadata?.physiological_scores?.weight || 'N/A',
      bmi: assessmentData.bodyCompositionData?.BMI || assessmentData.vitalsMap?.metadata?.physiological_scores?.bmi || 'N/A',
      assessmentDate: new Date(assessmentData.timestamp).toLocaleDateString(),
      timestamp: assessmentData.timestamp
    };
  }

  calculateAge(dobString) {
    try {
      const dob = new Date(dobString);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    } catch (error) {
      return 'N/A';
    }
  }

  getOverallScore(assessmentData) {
    // Multiple fallback options for overall score
    return assessmentData.accuracy || 
           assessmentData.vitalsMap?.wellness_score || 
           assessmentData.finalScore || 
           this.calculateAverageScore(assessmentData) || 
           'N/A';
  }

  calculateAverageScore(assessmentData) {
    const scores = [];
    
    // Exercise scores
    if (assessmentData.exercises && Array.isArray(assessmentData.exercises)) {
      assessmentData.exercises.forEach(exercise => {
        if (exercise.analysisScore) scores.push(exercise.analysisScore);
      });
    }
    
    // Vital scores
    if (assessmentData.vitalsMap?.wellness_score) {
      scores.push(assessmentData.vitalsMap.wellness_score);
    }
    
    return scores.length > 0 ? 
      Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 
      null;
  }

  generateSectionContent(section, assessmentData) {
    switch (section.type) {
      case 'vitals':
        return this.generateVitalsSection(assessmentData);
      case 'body_composition':
        return this.generateBodyCompositionSection(assessmentData);
      case 'exercises':
        return this.generateExercisesSection(assessmentData);
      case 'cardiovascular':
        return this.generateCardiovascularSection(assessmentData);
      case 'glucose':
        return this.generateGlucoseSection(assessmentData);
      case 'risk_assessment':
        return this.generateRiskAssessmentSection(assessmentData);
      default:
        return this.generateCustomSection(section, assessmentData);
    }
  }

  generateVitalsSection(assessmentData) {
    const vitals = assessmentData.vitalsMap?.vitals;
    if (!vitals) return '<p>No vital data available</p>';

    const vitalFields = [
      { label: 'Heart Rate', value: vitals.heart_rate, unit: 'bpm', path: 'vitalsMap.vitals.heart_rate' },
      { label: 'Blood Pressure', value: `${vitals.bp_sys}/${vitals.bp_dia}`, unit: 'mmHg', path: 'vitalsMap.vitals.bp_sys' },
      { label: 'Oxygen Saturation', value: vitals.oxy_sat_prcnt, unit: '%', path: 'vitalsMap.vitals.oxy_sat_prcnt' },
      { label: 'Respiratory Rate', value: vitals.resp_rate, unit: 'breaths/min', path: 'vitalsMap.vitals.resp_rate' }
    ];

    return this.generateFieldsGrid(vitalFields, assessmentData);
  }

  generateBodyCompositionSection(assessmentData) {
    const bodyComp = assessmentData.bodyCompositionData;
    const physio = assessmentData.vitalsMap?.metadata?.physiological_scores;

    const fields = [
      { label: 'BMI', value: bodyComp?.BMI || physio?.bmi, unit: 'kg/m²', path: 'bodyCompositionData.BMI' },
      { label: 'Body Fat %', value: bodyComp?.BFC || physio?.bodyfat, unit: '%', path: 'bodyCompositionData.BFC' },
      { label: 'Muscle Age', value: bodyComp?.M_Age, unit: 'years', path: 'bodyCompositionData.M_Age' },
      { label: 'Basal Metabolic Rate', value: bodyComp?.BMR, unit: 'kcal', path: 'bodyCompositionData.BMR' },
      { label: 'Lean Mass', value: bodyComp?.LM, unit: 'kg', path: 'bodyCompositionData.LM' },
      { label: 'Fat Mass', value: bodyComp?.FM, unit: 'kg', path: 'bodyCompositionData.FM' },
      { label: 'Waist-to-Hip Ratio', value: bodyComp?.WHR, unit: '', path: 'bodyCompositionData.WHR' },
      { label: 'Total Body Water', value: physio?.tbwp, unit: '%', path: 'vitalsMap.metadata.physiological_scores.tbwp' }
    ].filter(field => field.value !== undefined && field.value !== null);

    return this.generateFieldsGrid(fields, assessmentData);
  }

  generateExercisesSection(assessmentData) {
    if (!assessmentData.exercises || !Array.isArray(assessmentData.exercises)) {
      return '<p>No exercise data available</p>';
    }

    return assessmentData.exercises.map(exercise => `
      <div class="exercise-card">
        <div class="exercise-header">
          <h3>${exercise.name}</h3>
          <span class="exercise-score">Score: ${exercise.analysisScore || 'N/A'}%</span>
        </div>
        ${exercise.analysisList ? `
          <div class="analysis-list">
            <h4>Analysis:</h4>
            <ul>
              ${exercise.analysisList.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${exercise.tipsList ? `
          <div class="tips-list">
            <h4>Recommendations:</h4>
            <ul>
              ${exercise.tipsList.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        <div class="exercise-stats">
          <span>Reps: ${exercise.correctReps || 0}/${exercise.assignReps || 0}</span>
          <span>Sets: ${exercise.totalSets || 0}</span>
        </div>
      </div>
    `).join('');
  }

  generateCardiovascularSection(assessmentData) {
    const cardio = assessmentData.vitalsMap?.metadata?.cardiovascular;
    if (!cardio) return '<p>No cardiovascular data available</p>';

    const fields = [
      { label: 'Cardiac Output', value: cardio.cardiac_out, unit: 'L/min', path: 'vitalsMap.metadata.cardiovascular.cardiac_out' },
      { label: 'Mean Arterial Pressure', value: cardio.map, unit: 'mmHg', path: 'vitalsMap.metadata.cardiovascular.map' },
      { label: 'PRQ', value: cardio.prq, unit: '', path: 'vitalsMap.metadata.cardiovascular.prq' },
      { label: 'VO2 Max', value: assessmentData.vitalsMap?.metadata?.physiological_scores?.vo2max, unit: 'ml/kg/min', path: 'vitalsMap.metadata.physiological_scores.vo2max' }
    ];

    return this.generateFieldsGrid(fields, assessmentData);
  }

  generateGlucoseSection(assessmentData) {
    const glucose = assessmentData.vitalsMap?.metadata?.glucose_info;
    if (!glucose) return '<p>No glucose data available</p>';

    const fields = [
      { label: 'Diabetes Control Score', value: glucose.diabetes_control_score, unit: '', path: 'vitalsMap.metadata.glucose_info.diabetes_control_score' },
      { label: 'HbA1c', value: glucose.hba1c, unit: '%', path: 'vitalsMap.metadata.glucose_info.hba1c' },
      { label: 'Status', value: glucose.status, unit: '', path: 'vitalsMap.metadata.glucose_info.status' }
    ];

    return this.generateFieldsGrid(fields, assessmentData);
  }

  generateRiskAssessmentSection(assessmentData) {
    const riskScore = assessmentData.vitalsMap?.health_risk_score;
    const heartScores = assessmentData.vitalsMap?.metadata?.heart_scores;

    const fields = [
      { label: 'Health Risk Score', value: riskScore, unit: '', path: 'vitalsMap.health_risk_score' },
      { label: 'Stress Index', value: heartScores?.stress_index, unit: '', path: 'vitalsMap.metadata.heart_scores.stress_index' },
      { label: 'Heart Rate Variability', value: heartScores?.sdnn, unit: 'ms', path: 'vitalsMap.metadata.heart_scores.sdnn' },
      { label: 'RMSSD', value: heartScores?.rmssd, unit: 'ms', path: 'vitalsMap.metadata.heart_scores.rmssd' },
      { label: 'pNN50', value: heartScores?.pNN50_per, unit: '%', path: 'vitalsMap.metadata.heart_scores.pNN50_per' }
    ].filter(field => field.value !== undefined);

    return this.generateFieldsGrid(fields, assessmentData);
  }

  generateCustomSection(section, assessmentData) {
    if (!section.fields) return '<p>No section configuration available</p>';
    
    const fields = section.fields.map(field => {
      const value = getDataByPath(assessmentData, field.data_path);
      return {
        label: field.label,
        value: value,
        unit: field.unit,
        path: field.data_path,
        format: field.format
      };
    });

    return this.generateFieldsGrid(fields, assessmentData);
  }

  generateFieldsGrid(fields, assessmentData) {
    const validFields = fields.filter(field => field.value !== undefined && field.value !== null);

    if (validFields.length === 0) {
      return '<p>No data available for this section</p>';
    }

    return `
      <div class="fields-grid">
        ${validFields.map(field => {
          const classification = classifyValue(field.value, field.classification);
          let displayValue = 'N/A';
          
          if (field.value !== null && field.value !== undefined) {
            if (field.format === 'percentage') {
              displayValue = `${parseFloat(field.value).toFixed(1)}%`;
            } else if (field.unit) {
              displayValue = `${field.value} ${field.unit}`;
            } else {
              displayValue = field.value.toString();
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
        }).join('')}
      </div>
    `;
  }

  generateHTMLReport(assessmentData, config) {
    const patientInfo = this.extractPatientInfo(assessmentData);
    const overallScore = this.getOverallScore(assessmentData);
    const scoreColor = overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#f59e0b' : '#ef4444';

    const timestamp = new Date().toLocaleString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const sectionsHTML = config.sections.map(section => {
      const sectionContent = this.generateSectionContent(section, assessmentData);
      
      return `
        <div class="section">
          <div class="section-header">
            <div class="section-icon">${section.icon || '📊'}</div>
            <h2 class="section-title">${section.title}</h2>
          </div>
          ${sectionContent}
        </div>
      `;
    }).join('');

    // Enhanced CSS with exercise styles
    const exerciseStyles = `
      .exercise-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      }
      
      .exercise-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #f1f5f9;
      }
      
      .exercise-header h3 {
        margin: 0;
        font-size: 18px;
        color: #1e293b;
      }
      
      .exercise-score {
        background: #4f46e5;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
      }
      
      .analysis-list, .tips-list {
        margin-bottom: 15px;
      }
      
      .analysis-list h4, .tips-list h4 {
        margin: 0 0 10px 0;
        font-size: 14px;
        color: #475569;
      }
      
      .analysis-list ul, .tips-list ul {
        margin: 0;
        padding-left: 20px;
      }
      
      .analysis-list li, .tips-list li {
        margin-bottom: 5px;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .exercise-stats {
        display: flex;
        gap: 20px;
        font-size: 14px;
        color: #64748b;
      }
    `;

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
            justify-content: space-between;
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
        
        ${exerciseStyles}
        
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
            .exercise-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
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
                    <span class="info-value">${patientInfo.sessionId}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Assessment Type</span>
                    <span class="info-value">${patientInfo.assessmentType}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Patient Gender</span>
                    <span class="info-value">${patientInfo.gender}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Age</span>
                    <span class="info-value">${patientInfo.age}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Height</span>
                    <span class="info-value">${patientInfo.height} cm</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Weight</span>
                    <span class="info-value">${patientInfo.weight} kg</span>
                </div>
                <div class="info-item">
                    <span class="info-label">BMI</span>
                    <span class="info-value">${patientInfo.bmi}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Assessment Date</span>
                    <span class="info-value">${patientInfo.assessmentDate}</span>
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
      const fileName = `report_${assessmentData.session_id}_${Date.now()}.pdf`;
      const filePath = join(this.outputDir, fileName);

      // Check if file already exists
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
