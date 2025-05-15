import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  // Check if current path matches the specified path
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="flex flex-col h-full p-4 bg-gray-800 text-white w-64">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Fableration Admin</h2>
        {user && (
          <p className="mt-2 text-sm text-gray-400">{user.email}</p>
        )}
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link
              to="/admin"
              className={`flex items-center p-2 rounded hover:bg-gray-700 ${
                isActive('/admin') ? 'bg-gray-700 font-medium' : ''
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/admin/blogs"
              className={`flex items-center p-2 rounded hover:bg-gray-700 ${
                isActive('/admin/blogs') ? 'bg-gray-700 font-medium' : ''
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              Blog
            </Link>
          </li>
          <li>
            <Link
              to="/admin/announcements"
              className={`flex items-center p-2 rounded hover:bg-gray-700 ${
                isActive('/admin/announcements') ? 'bg-gray-700 font-medium' : ''
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
              </svg>
              Announcement
            </Link>
          </li>
          <li>
            <Link
              to="/admin/events"
              className={`flex items-center p-2 rounded hover:bg-gray-700 ${
                isActive('/admin/events') ? 'bg-gray-700 font-medium' : ''
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Event
            </Link>
          </li>
          <li>
            <Link
              to="/admin/highlights"
              className={`flex items-center p-2 rounded hover:bg-gray-700 ${
                isActive('/admin/highlights') ? 'bg-gray-700 font-medium' : ''
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zm12 9a1 1 0 00-1-1H6a1 1 0 100 2h10a1 1 0 001-1z" clipRule="evenodd" />
              </svg>
              Highlights
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="pt-4 mt-6 border-t border-gray-700">
        <Link
          to="/admin/password"
          className={`flex items-center w-full p-2 rounded hover:bg-gray-700 mb-2 ${
            isActive('/admin/password') ? 'bg-gray-700 font-medium' : ''
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Change Password
        </Link>
        
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-2 rounded hover:bg-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm6.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 