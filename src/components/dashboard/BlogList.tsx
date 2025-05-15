import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import type { Blog } from '../../api';

// 添加API基础URL常量
const API_BASE_URL = 'http://localhost:3001';

// 处理图片URL，如果是相对路径则加上API基础URL
const getFullImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
};

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load blog data
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const data = await api.blogs.getAll();
        setBlogs(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
        setError('Failed to load blog posts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Delete blog handler
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await api.blogs.delete(id);
        setBlogs(blogs.filter(blog => blog.id !== id));
      } catch (err) {
        console.error('Failed to delete blog:', err);
        alert('Failed to delete the post. Please try again.');
      }
    }
  };

  // Toggle publish status handler
  const handleTogglePublish = async (id: number) => {
    try {
      const blog = blogs.find(b => b.id === id);
      if (!blog) return;

      const updatedBlog = {
        ...blog,
        published: !blog.published,
        updatedAt: new Date().toISOString()
      };

      await api.blogs.update(id, updatedBlog);
      
      setBlogs(
        blogs.map(blog => 
          blog.id === id ? { ...blog, published: !blog.published } : blog
        )
      );
    } catch (err) {
      console.error('Failed to update blog:', err);
      alert('Failed to update the post status. Please try again.');
    }
  };

  // Filtered blogs based on category
  const filteredBlogs = categoryFilter === 'All' 
    ? blogs 
    : blogs.filter(blog => blog.category === categoryFilter);

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Category filter */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <label htmlFor="category-filter" className="mr-2 text-sm font-medium text-gray-700">
            Filter by Category:
          </label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="All">All Categories</option>
            <option value="Blogs">Blogs</option>
            <option value="News">News</option>
            <option value="Events">Events</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">
          Total: {filteredBlogs.length} posts
        </div>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        {filteredBlogs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No posts found.</p>
            <Link to="/admin/blogs/new" className="mt-2 text-indigo-600 hover:text-indigo-500">
              Create your first post &rarr;
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredBlogs.map(blog => (
              <li key={blog.id}>
                <div className="block hover:bg-gray-50">
                  <div className="p-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-1 min-w-0 pr-4">
                        {blog.imageUrl && (
                          <div className="flex-shrink-0 mr-4">
                            <img 
                              src={getFullImageUrl(blog.imageUrl)} 
                              alt={blog.title}
                              className="w-16 h-16 object-cover rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = 'https://via.placeholder.com/64?text=Error';
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {blog.title}
                          </h3>
                          <div className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {blog.summary}
                          </div>
                          <div className="flex flex-wrap mt-2 text-xs text-gray-500 gap-x-4">
                            <span>Created: {new Date(blog.createdAt || '').toLocaleDateString()}</span>
                            <span>Updated: {new Date(blog.updatedAt || '').toLocaleDateString()}</span>
                            <span className="font-medium text-gray-700">{blog.category}</span>
                            {blog.externalLink && (
                              <a 
                                href={blog.externalLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-indigo-500 hover:text-indigo-700"
                              >
                                External Link
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          blog.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {blog.published ? 'Published' : 'Draft'}
                        </span>
                        <div className="flex mt-2 space-x-2">
                          <Link
                            to={`/admin/blogs/edit/${blog.id}`}
                            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleTogglePublish(blog.id!)}
                            className={`px-3 py-1 text-xs font-medium rounded-md ${
                              blog.published
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {blog.published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => handleDelete(blog.id!)}
                            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BlogList; 