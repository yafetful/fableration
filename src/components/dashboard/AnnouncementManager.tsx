import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import type { Announcement } from '../../api';

const AnnouncementManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true);
        const data = await api.announcements.getAll();
        setAnnouncements(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
        setError('Failed to fetch announcements, please try again');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await api.announcements.delete(id);
        setAnnouncements(announcements.filter(item => item.id !== id));
      } catch (err) {
        console.error('Failed to delete announcement:', err);
        alert('Failed to delete announcement, please try again');
      }
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const announcement = announcements.find(a => a.id === id);
      if (!announcement) return;

      const updatedAnnouncement = { 
        ...announcement,
        active: !announcement.active 
      };
      
      await api.announcements.update(id, updatedAnnouncement);
      
      setAnnouncements(
        announcements.map(item => 
          item.id === id ? { ...item, active: !item.active } : item
        )
      );
    } catch (err) {
      console.error('Failed to update announcement:', err);
      alert('Failed to update announcement status, please try again');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-md">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Announcement Management</h3>
        </div>
      </div>
      
      {announcements.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No announcement data.
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {announcements.map(announcement => (
            <li key={announcement.id} className="p-4 transition-colors duration-150 hover:bg-gray-50 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-sm font-medium text-gray-900">
                    {announcement.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {announcement.message}
                  </p>
                  {announcement.url && (
                    <a 
                      href={announcement.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      {announcement.url}
                    </a>
                  )}
                  <div className="mt-1 text-xs text-gray-500">
                    <span>Created at: {new Date(announcement.createdAt || '').toLocaleDateString()}</span>
                    {announcement.expiresAt && (
                      <span className="ml-3">
                        Expires at: {new Date(announcement.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    announcement.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {announcement.active ? 'Activated' : 'Not activated'}
                  </span>
                  <Link
                    to={`/admin/announcements/edit/${announcement.id}`}
                    className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleToggleActive(announcement.id!)}
                    className={`px-3 py-1 text-xs font-medium rounded-md ${
                      announcement.active
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {announcement.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id!)}
                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AnnouncementManager; 