# Machine Project

A full-stack application with a Node.js/Express backend and a React/Vite frontend for assessment report generation and management.

## Folder Structure

```
backend/
  package.json
  server.js
  config/
    reportConfig.js
  data/
    sampleData.js
  generated-reports/
  middleware/
    auth.js
  routes/
    auth.js
    reports.js
  utils/
    pdfGenerator.js
frontend/
  eslint.config.js
  index.html
  package.json
  README.md
  vite.config.js
  public/
    vite.svg
  src/
    App.jsx
    index.css
    main.jsx
    assets/
      react.svg
    components/
      Dashboard.jsx
      auth/
        Login.jsx
        Register.jsx
      common/
        Navbar.jsx
        ProtectedRoute.jsx
    contexts/
      AuthContext.jsx
```

## Backend (Node.js/Express)
- Handles authentication, report generation, and API endpoints.
- Generates PDF reports based on assessment data and configuration.
- Stores generated reports in `generated-reports/`.

### Setup & Run Backend
1. Navigate to the backend folder:
   ```powershell
   cd backend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the server:
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
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the development server:
   ```powershell
   npm run dev
   ```
   The frontend runs on port 5173 by default.

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

## Notes
- Ensure both backend and frontend servers are running for full functionality.
- Update API URLs in frontend if backend runs on a different port or host.
- Place assessment data in `backend/data/sampleData.js` and configure report types in `backend/config/reportConfig.js`.
