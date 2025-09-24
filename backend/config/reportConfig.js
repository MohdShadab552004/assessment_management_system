// Configuration for different assessment types
export const assessmentConfigs = {
  // Health & Fitness Assessment
  "as_hr_02": {
    assessment_id: "as_hr_02",
    report_title: "Health & Fitness Assessment Report",
    sections: [
      {
        id: "overall_health",
        title: "Overall Health Score",
        fields: [
          {
            id: "accuracy",
            label: "Overall Accuracy Score",
            data_path: "accuracy",
            unit: "%",
            format: "percentage",
            classification: {
              ranges: [
                { max: 50, label: "Poor", color: "#ef4444" },
                { min: 50, max: 75, label: "Fair", color: "#f59e0b" },
                { min: 75, max: 90, label: "Good", color: "#84cc16" },
                { min: 90, label: "Excellent", color: "#10b981" }
              ]
            }
          },
          {
            id: "wellness_score",
            label: "Wellness Score",
            data_path: "vitalsMap.wellness_score",
            unit: "points",
            classification: {
              ranges: [
                { max: 60, label: "Low", color: "#ef4444" },
                { min: 60, max: 80, label: "Moderate", color: "#f59e0b" },
                { min: 80, label: "High", color: "#10b981" }
              ]
            }
          }
        ]
      },
      {
        id: "key_vitals",
        title: "Key Body Vitals",
        fields: [
          {
            id: "heart_rate",
            label: "Heart Rate",
            data_path: "vitalsMap.vitals.heart_rate",
            unit: "bpm",
            classification: {
              ranges: [
                { max: 60, label: "Low", color: "#3b82f6" },
                { min: 60, max: 100, label: "Normal", color: "#10b981" },
                { min: 100, label: "High", color: "#ef4444" }
              ]
            }
          },
          {
            id: "bp_sys",
            label: "Blood Pressure (Systolic)",
            data_path: "vitalsMap.vitals.bp_sys",
            unit: "mmHg",
            classification: {
              ranges: [
                { max: 90, label: "Low", color: "#3b82f6" },
                { min: 90, max: 120, label: "Normal", color: "#10b981" },
                { min: 120, max: 140, label: "Elevated", color: "#f59e0b" },
                { min: 140, label: "High", color: "#ef4444" }
              ]
            }
          },
          {
            id: "bp_dia",
            label: "Blood Pressure (Diastolic)",
            data_path: "vitalsMap.vitals.bp_dia",
            unit: "mmHg",
            classification: {
              ranges: [
                { max: 60, label: "Low", color: "#3b82f6" },
                { min: 60, max: 80, label: "Normal", color: "#10b981" },
                { min: 80, max: 90, label: "Elevated", color: "#f59e0b" },
                { min: 90, label: "High", color: "#ef4444" }
              ]
            }
          }
        ]
      },
      {
        id: "body_composition",
        title: "Body Composition",
        fields: [
          {
            id: "bmi",
            label: "Body Mass Index (BMI)",
            data_path: "bodyCompositionData.BMI",
            classification: {
              ranges: [
                { max: 18.5, label: "Underweight", color: "#3b82f6" },
                { min: 18.5, max: 25, label: "Normal", color: "#10b981" },
                { min: 25, max: 30, label: "Overweight", color: "#f59e0b" },
                { min: 30, label: "Obese", color: "#ef4444" }
              ]
            }
          },
          {
            id: "body_fat",
            label: "Body Fat Percentage",
            data_path: "bodyCompositionData.BFC",
            unit: "%",
            classification: {
              ranges: [
                { max: 15, label: "Low", color: "#3b82f6" },
                { min: 15, max: 25, label: "Normal", color: "#10b981" },
                { min: 25, label: "High", color: "#ef4444" }
              ]
            }
          }
        ]
      },
      {
        id: "fitness_levels",
        title: "Fitness Levels",
        fields: [
          {
            id: "vo2max",
            label: "VO2 Max",
            data_path: "vitalsMap.metadata.physiological_scores.vo2max",
            classification: {
              ranges: [
                { max: 30, label: "Poor", color: "#ef4444" },
                { min: 30, max: 45, label: "Fair", color: "#f59e0b" },
                { min: 45, max: 60, label: "Good", color: "#84cc16" },
                { min: 60, label: "Excellent", color: "#10b981" }
              ]
            }
          }
        ]
      }
    ]
  },

  // Cardiac Assessment
  "as_card_01": {
    assessment_id: "as_card_01",
    report_title: "Cardiac Assessment Report",
    sections: [
      {
        id: "overall_health",
        title: "Overall Health Score",
        fields: [
          {
            id: "accuracy",
            label: "Assessment Accuracy",
            data_path: "accuracy",
            unit: "%",
            format: "percentage"
          }
        ]
      },
      {
        id: "cardiac_health",
        title: "Cardiac Health Metrics",
        fields: [
          {
            id: "heart_rate",
            label: "Resting Heart Rate",
            data_path: "vitalsMap.vitals.heart_rate",
            unit: "bpm",
            classification: {
              ranges: [
                { max: 60, label: "Excellent", color: "#10b981" },
                { min: 60, max: 80, label: "Good", color: "#84cc16" },
                { min: 80, max: 100, label: "Fair", color: "#f59e0b" },
                { min: 100, label: "Poor", color: "#ef4444" }
              ]
            }
          },
          {
            id: "cardiac_output",
            label: "Cardiac Output",
            data_path: "vitalsMap.metadata.cardiovascular.cardiac_out",
            unit: "L/min",
            classification: {
              ranges: [
                { max: 4.0, label: "Low", color: "#ef4444" },
                { min: 4.0, max: 6.0, label: "Normal", color: "#10b981" },
                { min: 6.0, label: "High", color: "#3b82f6" }
              ]
            }
          }
        ]
      },
      {
        id: "body_composition",
        title: "Body Composition",
        fields: [
          {
            id: "bmi",
            label: "Body Mass Index",
            data_path: "bodyCompositionData.BMI",
            classification: {
              ranges: [
                { max: 18.5, label: "Underweight", color: "#3b82f6" },
                { min: 18.5, max: 25, label: "Normal", color: "#10b981" },
                { min: 25, label: "Overweight", color: "#ef4444" }
              ]
            }
          }
        ]
      }
    ]
  }
};

// Helper function to get data by JSON path
export function getDataByPath(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

// Helper function to classify values
export function classifyValue(value, classification) {
  if (!classification || !classification.ranges) return null;

  const numValue = parseFloat(value);
  if (isNaN(numValue)) return null;

  for (const range of classification.ranges) {
    const minMatch = range.min === undefined || numValue >= range.min;
    const maxMatch = range.max === undefined || numValue <= range.max;

    if (minMatch && maxMatch) {
      return {
        label: range.label,
        color: range.color
      };
    }
  }

  return null;
}