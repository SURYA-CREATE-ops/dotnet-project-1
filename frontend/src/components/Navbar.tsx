import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const isAuthenticated = authService.isAuthenticated()
  const user = authService.getUser()

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-4">
            <Link to="/" className="flex items-center py-5 px-2 text-gray-700 font-bold text-lg">
              JobFlow
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="py-5 px-3 text-gray-700 hover:text-blue-600 text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/jobs" className="py-5 px-3 text-gray-700 hover:text-blue-600 text-sm font-medium">
                  Jobs
                </Link>
                <span className="text-gray-500 text-sm">
                  Welcome, <span className="font-semibold text-gray-700">{user?.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="py-2 px-3 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="py-2 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                  Login
                </Link>
                <Link to="/register" className="py-2 px-3 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
