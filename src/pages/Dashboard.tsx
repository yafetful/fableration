import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import api from '../api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    blogs: 0,
    announcements: 0,
    events: 0,
    highlights: 0
  });
  
  // Get statistics data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get blog count
        const blogs = await api.blogs.getAll();
        // Get announcement count
        const announcements = await api.announcements.getAll();
        // Get event count
        const events = await api.events.getAll();
        // Get highlight count
        const highlights = await api.highlights.getAll();
        
        setStats({
          blogs: blogs.length,
          announcements: announcements.length,
          events: events.length,
          highlights: highlights.length
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow">
          <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
        </header>
        
        <main>
          <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Dashboard content */}
            <div className="px-4 py-6 sm:px-0">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Blog stats card */}
                <div className="p-5 bg-white rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-medium text-gray-900">Blogs</h2>
                      <p className="text-3xl font-semibold text-gray-700">{stats.blogs}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <a href="/admin/blogs" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      Manage blogs &rarr;
                    </a>
                  </div>
                </div>
                
                {/* Announcement stats card */}
                <div className="p-5 bg-white rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-green-100 rounded-full">
                      <svg className="w-6 h-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-medium text-gray-900">Announcements</h2>
                      <p className="text-3xl font-semibold text-gray-700">{stats.announcements}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <a href="/admin/announcements" className="text-sm font-medium text-green-600 hover:text-green-500">
                      Manage announcements &rarr;
                    </a>
                  </div>
                </div>
                
                {/* Events stats card */}
                <div className="p-5 bg-white rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full">
                      <svg className="w-6 h-6 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-medium text-gray-900">Events</h2>
                      <p className="text-3xl font-semibold text-gray-700">{stats.events}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <a href="/admin/events" className="text-sm font-medium text-amber-600 hover:text-amber-500">
                      Manage events &rarr;
                    </a>
                  </div>
                </div>
                
                {/* Highlights stats card */}
                <div className="p-5 bg-white rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full">
                      <svg className="w-6 h-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-medium text-gray-900">Highlights</h2>
                      <p className="text-3xl font-semibold text-gray-700">{stats.highlights}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <a href="/admin/highlights" className="text-sm font-medium text-purple-600 hover:text-purple-500">
                      Manage highlights &rarr;
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Quick actions */}
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
                  <a
                    href="/admin/blogs/new"
                    className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full">
                      <svg className="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-900">Create New Blog</p>
                      <p className="text-sm text-gray-500">Add a new blog post</p>
                    </div>
                  </a>
                  
                  <a
                    href="/admin/announcements/new"
                    className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-green-100 rounded-full">
                      <svg className="w-5 h-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-900">Create New Announcement</p>
                      <p className="text-sm text-gray-500">Add a new site announcement</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 