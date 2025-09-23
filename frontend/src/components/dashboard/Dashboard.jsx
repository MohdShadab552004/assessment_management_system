import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../common/Navbar';

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('api/reports/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const generateReport = async () => {
    if (!selectedSession) {
      setMessage('Please select a session');
      return;
    }

    setLoading(true);
    setMessage('');
    setDownloadUrl('');

    try {
      const response = await axios.post('api/reports/generate-report', {
        session_id: selectedSession
      });

      setMessage('PDF generated successfully!');
     
      const downloadUrl = `${import.meta.env.VITE_API_URL}/api/reports/download/${response.data.file_name}`;
      setDownloadUrl(downloadUrl);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error generating PDF');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Generate PDF Report</h2>
              
              {/* Session Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Assessment Session
                </label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Choose a session...</option>
                  {sessions.map(session => (
                    <option key={session.session_id} value={session.session_id}>
                      {session.session_id} - {session.assessment_id} - {new Date(session.timestamp).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateReport}
                disabled={loading || !selectedSession}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Generating PDF...' : 'Generate PDF Report'}
              </button>

              {/* Messages */}
              {message && (
                <div className={`mt-4 p-3 rounded-md ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {message}
                </div>
              )}

              {/* Download Button */}
              {downloadUrl && (
                <div className="mt-4">
                  <a
                   href={downloadUrl}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    Download PDF Report
                  </a>
                  <p className="text-xs text-gray-500 mt-2">
                    File ready: {downloadUrl.split('/').pop()}
                  </p>
                </div>
              )}

              {/* Configuration Info */}
              <div className="mt-8 p-4 bg-gray-50 rounded-md">
                <h3 className="text-md font-medium text-gray-900 mb-2">Configuration Flexibility</h3>
                <p className="text-sm text-gray-600">
                  This system supports different assessment types through configuration files. 
                  Adding new assessment types only requires updating the configuration, not modifying code.
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  <strong>Current supported assessments:</strong> as_hr_02 (Health & Fitness), as_card_01 (Cardiac)
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;