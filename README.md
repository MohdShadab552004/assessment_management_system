# Assessment management Project

A full-stack application with a Node.js/Express backend and a React/Vite frontend for assessment report generation and management.

## Folder Structure

```
project-root/
│
├── backend/                     # Backend (Node.js + Express + MongoDB)
│   ├── .env                     # Environment variables
│   ├── .gitignore               # Git ignore file
│   ├── package.json             # Backend dependencies
│   ├── server.js                # Entry point for backend server
│   │
│   ├── config/                  # Config files
│   │   └── reportConfig.js
│   │
│   ├── controllers/             # Request handlers (business logic)
│   │   ├── auth.controller.js
│   │   └── report.controller.js
│   │
│   ├── data/                    # Sample/static data
│   │   └── sampleData.js
│   │
│   ├── generated-reports/       # Auto-generated PDF reports
│   │   └── .gitkeep             # Empty dir placeholder
│   │
│   ├── middleware/              # Custom middlewares
│   │   └── auth.middleware.js
│   │
│   ├── routes/                  # API routes
│   │   ├── auth.route.js
│   │   └── reports.route.js
│   │
│   ├── service/                 # Business services (e.g., PDF generation)
│   │   └── pdfGenerator.js
│   │
│   ├── utils/                   # Utility functions
│   │   └── jwt.js
│   │
│   └── validation/              # Validation schemas
│       ├── auth.validation.js
│       └── report.validation.js
│
├── frontend/                    # Frontend (React + Vite + Tailwind)
│   ├── .env                     # Frontend environment variables
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html               # Root HTML
│   ├── package.json             # Frontend dependencies
│   ├── README.md
│   ├── vite.config.js           # Vite configuration
│   │
│   ├── public/                  # Static public assets
│   │   └── vite.svg
│   │
│   ├── src/                     # React source code
│   │   ├── App.jsx              # Main App component
│   │   ├── index.css            # Global styles
│   │   ├── main.jsx             # React entry point
│   │   │
│   │   ├── assets/              # Local assets (images/icons)
│   │   │   └── react.svg
│   │   │
│   │   ├── components/          # Reusable React components
│   │   │   ├── auth/            # Auth-related components
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   │
│   │   │   ├── common/          # Common/shared components
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   │
│   │   │   └── dashboard/       # Dashboard-related components
│   │   │       └── Dashboard.jsx
│   │   │
│   │   └── contexts/            # React Context API
│   │       └── AuthContext.jsx
│   │
│   └── ...
│
└── README.md                    # Main project readme

```

## Backend (Node.js/Express)
- Handles authentication, report generation, and API endpoints.
- Generates PDF reports based on assessment data and configuration.
- Stores generated reports in `generated-reports/`.

### Setup & Run Backend
1. Clone the repository:
  ```powershell
  git clone https://github.com/MohdShadab552004/assessment_management_system.git
  cd assessment_management_system
  ```
2. Navigate to the backend folder:
  ```powershell
  cd backend
  ```
2. Create a `.env` file in the backend folder with the following content:
  ```env
  PORT=5000
  JWT_SECRET=JWT_SECRET
  JWT_EXPIRES_IN=24h
  FRONTEND_URL=http://localhost:3000
  NODE_ENV=development
  ```
3. Install dependencies:
  ```powershell
  npm install
  ```
4. Start the server:
  ```powershell
  npm start
  ```
  The backend runs on the port specified in `server.js` (commonly 5000).

## Frontend (React/Vite)
- Provides user interface for login, registration, dashboard, and report management.
- Uses context for authentication state.

### Setup & Run Frontend
1. Navigate to the frontend folder:
  ```powershell
  cd frontend
  ```
2. Create a `.env` file in the frontend folder with the following content:
  ```env
  VITE_API_URL=http://localhost:5000
  ```
3. Install dependencies:
  ```powershell
  npm install
  ```
4. Start the development server:
  ```powershell
  npm run dev
  ```
  The frontend runs on port 3000 by default.

## API Endpoints
- `/api/auth/login` - User login
- `/api/auth/register` - User registration
- `/api/reports/generate-report` - Generate PDF report
- `/api/reports/download/:fileName` - Download generated report
- `/api/reports/sessions` - List available sessions

## Authentication
- JWT-based authentication for protected routes and API endpoints.

## PDF Generation
- Uses custom logic in `utils/pdfGenerator.js` to create PDF reports from assessment data.


## Data Structure & Session Queries
- All assessment data is stored in `backend/data/sampleData.js` as an array of objects, each with a unique `session_id`.
- To query by session, filter the array for the desired `session_id`:
  ```js
  const assessment = assessmentData.find(data => data.session_id === session_id);
  ```

## Configuration System Documentation
- All report configurations are defined in `backend/config/reportConfig.js` under `assessmentConfigs`.
- Each config maps an `assessment_id` to a report structure, including sections, fields, and classification ranges.

### Adding New Assessment Types
1. Open `backend/config/reportConfig.js`.
2. Add a new entry to `assessmentConfigs`:
   ```js
   assessmentConfigs["new_assessment_id"] = {
     assessment_id: "new_assessment_id",
     report_title: "New Assessment Report",
     sections: [ /* ... */ ]
   };
   ```
3. Ensure your data in `sampleData.js` uses the new `assessment_id`.

### Modifying Data Field Mappings
- Each field in a section uses `data_path` to map to a property in the assessment data object.
- Example:
  ```js
  { id: "bmi", label: "BMI", data_path: "bodyCompositionData.BMI" }
  ```
- To change a mapping, update the `data_path` to match your data structure.

### Updating Classification Ranges
- Fields can include a `classification` object with `ranges` for value-based labels/colors.
- Example:
  ```js
  classification: {
    ranges: [
      { max: 18.5, label: "Underweight", color: "#3b82f6" },
      { min: 18.5, max: 25, label: "Normal", color: "#10b981" },
      { min: 25, label: "Overweight", color: "#ef4444" }
    ]
  }
  ```
- To update, modify/add/remove ranges as needed.

### Example Configuration Structure
```js
export const assessmentConfigs = {
  "as_hr_02": {
    assessment_id: "as_hr_02",
    report_title: "Health & Fitness Assessment Report",
    sections: [
      {
        id: "overall_health",
        title: "Overall Health Score",
        fields: [
          { id: "accuracy", label: "Overall Accuracy Score", data_path: "accuracy", unit: "%" }
        ]
      }
    ]
  }
};
```
