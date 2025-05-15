import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import type { Highlight } from '../../api';

const API_BASE_URL = '';

// Process image URL, add API base URL if it's a relative path
const getFullImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
};

// 处理展示标题/内容，处理换行符
const displayTitleContent = (highlight: Highlight) => {
  if (highlight.type === 'video') {
    // 对于视频类型，替换\n为实际换行，并且限制显示长度
    const content = highlight.title.replace(/\\n/g, '\n');
    const truncated = content.length > 50 ? content.substring(0, 50) + '...' : content;
    return (
      <div className="whitespace-pre-line text-sm font-medium text-gray-700">
        {truncated}
      </div>
    );
  } else {
    // 对于图片类型，正常显示标题
    return (
      <p className="text-sm font-medium text-indigo-600 truncate">
        {highlight.title}
      </p>
    );
  }
};

const HighlightManager: React.FC = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load highlights
  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.highlights.getAll();
        setHighlights(data);
      } catch (err) {
        console.error('Failed to fetch highlights:', err);
        setError('Failed to load highlights. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHighlights();
  }, []);

  // Delete highlight
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this highlight?')) {
      return;
    }

    try {
      await api.highlights.delete(id);
      // Remove from state after successful deletion
      setHighlights(highlights.filter(highlight => highlight.id !== id));
    } catch (err) {
      console.error('Failed to delete highlight:', err);
      alert('Failed to delete highlight. Please try again.');
    }
  };

  // Toggle highlight active status
  const handleToggleActive = async (highlight: Highlight) => {
    try {
      const updatedHighlight = {
        ...highlight,
        active: !highlight.active,
        updatedAt: new Date().toISOString()
      };

      await api.highlights.update(highlight.id as number, updatedHighlight);
      
      // Update local state after successful API call
      setHighlights(highlights.map(item => 
        item.id === highlight.id ? updatedHighlight : item
      ));
    } catch (err) {
      console.error('Failed to update highlight status:', err);
      alert('Failed to update highlight status. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="w-8 h-8 mr-2 text-indigo-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-700 bg-red-100 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold">Manage Highlights</h2>
        <Link 
          to="/admin/highlights/new" 
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Add New Highlight
        </Link>
      </div>

      {highlights.length === 0 ? (
        <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-md">
          No highlights found. Create your first highlight.
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {highlights.map(highlight => (
              <li key={highlight.id} className="block hover:bg-gray-50">
                <div className="flex items-center px-4 py-4 sm:px-6">
                  <div className="flex-shrink-0 w-12 h-12 mr-4">
                    {highlight.imageUrl ? (
                      <img 
                        src={getFullImageUrl(highlight.imageUrl)} 
                        alt={highlight.title} 
                        className="object-cover w-12 h-12 rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/48?text=Error';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-12 h-12 text-gray-400 bg-gray-100 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      {displayTitleContent(highlight)}
                      <div className="flex items-center ml-2">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            highlight.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {highlight.active ? 'Active' : 'Inactive'}
                        </span>
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2"
                        >
                          {highlight.type || 'Image'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        {highlight.url ? (
                          <a href={highlight.url} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline truncate">
                            {highlight.url}
                          </a>
                        ) : (
                          <span className="italic">No URL provided</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center ml-4 space-x-2">
                    <button
                      onClick={() => handleToggleActive(highlight)}
                      className="p-2 text-gray-400 rounded-full hover:text-gray-500 hover:bg-gray-100"
                      title={highlight.active ? 'Deactivate' : 'Activate'}
                    >
                      {highlight.active ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    
                    <Link
                      to={`/admin/highlights/${highlight.id}`}
                      className="p-2 text-gray-400 rounded-full hover:text-gray-500 hover:bg-gray-100"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </Link>
                    
                    <button
                      onClick={() => highlight.id && handleDelete(highlight.id)}
                      className="p-2 text-gray-400 rounded-full hover:text-red-500 hover:bg-gray-100"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HighlightManager; 