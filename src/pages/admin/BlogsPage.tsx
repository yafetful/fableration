import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import BlogList from '../../components/dashboard/BlogList';

const BlogsPage: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* 侧边栏 */}
      <Sidebar />
      
      {/* 主内容区 */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow">
          <div className="flex items-center justify-between px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
            <Link
              to="/admin/blogs/new"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Blog
            </Link>
          </div>
        </header>
        
        <main>
          <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <BlogList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BlogsPage; 