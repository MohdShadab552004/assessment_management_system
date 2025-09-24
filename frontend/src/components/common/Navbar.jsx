import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

const Header = () => {
  const { user, logout } = useAuth();
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">ASSESS.PDF</h1>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <span className="text-gray-700 text-center sm:text-left">Welcome, <span>{user?.name}</span></span>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md w-full sm:w-auto"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header