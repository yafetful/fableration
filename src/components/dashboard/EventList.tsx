import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import type { Event } from '../../api';

const API_BASE_URL = '';

const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getFullImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_BASE_URL}${imageUrl}`;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const data = await api.events.getAll();
        setEvents(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Delete event handler
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        await api.events.delete(id);
        setEvents(events.filter(event => event.id !== id));
      } catch (err) {
        console.error('Failed to delete event:', err);
        alert('Failed to delete the event. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Toggle publish status handler
  const handleTogglePublish = async (id: number) => {
    try {
      setIsLoading(true);
      const event = events.find(e => e.id === id);
      if (!event) return;

      const updatedEvent = {
        ...event,
        published: !event.published,
        updatedAt: new Date().toISOString()
      };

      await api.events.update(id, updatedEvent);
      
      setEvents(
        events.map(event => 
          event.id === id ? { ...event, published: !event.published } : event
        )
      );
    } catch (err) {
      console.error('Failed to update event:', err);
      alert('Failed to update the event status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter events
  const getFilteredEvents = () => {
    switch (filter) {
      case 'published':
        return events.filter(event => event.published);
      case 'draft':
        return events.filter(event => !event.published);
      default:
        return events;
    }
  };

  const filteredEvents = getFilteredEvents();

  // Render loading state
  if (isLoading && events.length === 0) {
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
      {/* Filter options */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <label htmlFor="event-filter" className="mr-2 text-sm font-medium text-gray-700">
            Filter Events:
          </label>
          <select
            id="event-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'published' | 'draft')}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">All Events</option>
            <option value="published">Published Events</option>
            <option value="draft">Draft Events</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">
          Total: {filteredEvents.length} events
        </div>
      </div>

      {isLoading && events.length > 0 && (
        <div className="mb-4 p-2 bg-blue-50 text-blue-700 text-sm rounded">
          Loading...
        </div>
      )}

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        {filteredEvents.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No events found.</p>
            <Link to="/admin/events/new" className="mt-2 text-indigo-600 hover:text-indigo-500">
              Create your first event &rarr;
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredEvents.map(event => (
              <li key={event.id}>
                <div className="block hover:bg-gray-50">
                  <div className="p-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-1 min-w-0 pr-4">
                        {event.imageUrl && (
                          <div className="flex-shrink-0 mr-4">
                            <img 
                              src={getFullImageUrl(event.imageUrl)} 
                              alt={event.title}
                              className="w-20 h-12 object-cover rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = 'https://via.placeholder.com/320x180?text=Image';
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {event.title}
                          </h3>
                          <div className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {event.summary}
                          </div>
                          <div className="flex flex-wrap mt-2 text-xs text-gray-500 gap-x-4">
                            <span>
                              Created: {new Date(event.createdAt || '').toLocaleDateString()}
                            </span>
                            <span>
                              Updated: {new Date(event.updatedAt || '').toLocaleDateString()}
                            </span>
                            <span>
                              Items: {event.items?.length || 0}
                            </span>
                            {event.externalLink && (
                              <a 
                                href={event.externalLink} 
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
                          event.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {event.published ? 'Published' : 'Draft'}
                        </span>
                        <div className="flex mt-2 space-x-2">
                          <Link
                            to={`/admin/events/${event.id}`}
                            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleTogglePublish(event.id!)}
                            className={`px-3 py-1 text-xs font-medium rounded-md ${
                              event.published
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                            disabled={isLoading}
                          >
                            {event.published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => handleDelete(event.id!)}
                            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                            disabled={isLoading}
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

export default EventList; 