// API Interface
const API_URL = '/fab-api';

interface User {
  id: number;
  email: string;
  role: string;
}

interface Blog {
  id?: number;
  title: string;
  content?: string;
  summary: string;
  category: string;
  imageUrl?: string;
  externalLink?: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Announcement {
  id?: number;
  title: string;
  message: string;
  url?: string;
  active: boolean;
  createdAt?: string;
  expiresAt?: string;
}

interface Highlight {
  id?: number;
  title: string;
  imageUrl?: string;
  url?: string;
  type?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface EventItem {
  id?: number;
  eventId?: number;
  name: string;
  content?: string;
  iconUrl?: string;
  position?: number;
}

interface Event {
  id?: number;
  title: string;
  imageUrl?: string;
  summary: string;
  content?: string;
  externalLink?: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
  items?: EventItem[];
}

// Get authentication token
const getToken = () => localStorage.getItem('token');

// Create request headers with authentication
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// API request handler
const api = {
  // Blog API
  blogs: {
    // Get all blogs
    getAll: async (): Promise<Blog[]> => {
      const response = await fetch(`${API_URL}/blogs`);
      if (!response.ok) throw new Error('Failed to fetch blogs');
      return response.json();
    },
    
    // Get a single blog
    getById: async (id: string | number): Promise<Blog> => {
      const response = await fetch(`${API_URL}/blogs/${id}`);
      if (!response.ok) throw new Error('Failed to fetch blog');
      return response.json();
    },
    
    // Create a blog
    create: async (blog: Blog): Promise<Blog> => {
      const response = await fetch(`${API_URL}/blogs`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(blog)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create blog');
      }
      
      return response.json();
    },
    
    // Update a blog
    update: async (id: string | number, blog: Blog): Promise<Blog> => {
      const response = await fetch(`${API_URL}/blogs/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(blog)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update blog');
      }
      
      return response.json();
    },
    
    // Delete a blog
    delete: async (id: string | number): Promise<void> => {
      const response = await fetch(`${API_URL}/blogs/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete blog');
      }
    }
  },
  
  // Announcement API
  announcements: {
    // Get all announcements
    getAll: async (): Promise<Announcement[]> => {
      const response = await fetch(`${API_URL}/announcements`);
      if (!response.ok) throw new Error('Failed to fetch announcements');
      return response.json();
    },
    
    // Get active announcements
    getActive: async (): Promise<Announcement[]> => {
      const response = await fetch(`${API_URL}/announcements/active`);
      if (!response.ok) throw new Error('Failed to fetch active announcements');
      return response.json();
    },
    
    // Get a single announcement
    getById: async (id: string | number): Promise<Announcement> => {
      const response = await fetch(`${API_URL}/announcements/${id}`);
      if (!response.ok) throw new Error('Failed to fetch announcement');
      return response.json();
    },
    
    // Create an announcement
    create: async (announcement: Announcement): Promise<Announcement> => {
      const response = await fetch(`${API_URL}/announcements`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(announcement)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create announcement');
      }
      
      return response.json();
    },
    
    // Update an announcement
    update: async (id: string | number, announcement: Announcement): Promise<Announcement> => {
      const response = await fetch(`${API_URL}/announcements/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(announcement)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update announcement');
      }
      
      return response.json();
    },
    
    // Delete an announcement
    delete: async (id: string | number): Promise<void> => {
      const response = await fetch(`${API_URL}/announcements/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete announcement');
      }
    }
  },
  
  // Highlight API
  highlights: {
    // Get all highlights
    getAll: async (): Promise<Highlight[]> => {
      const response = await fetch(`${API_URL}/highlights`);
      if (!response.ok) throw new Error('Failed to fetch highlights');
      return response.json();
    },
    
    // Get active highlights
    getActive: async (): Promise<Highlight[]> => {
      const response = await fetch(`${API_URL}/highlights/active`);
      if (!response.ok) throw new Error('Failed to fetch active highlights');
      return response.json();
    },
    
    // Get a single highlight
    getById: async (id: string | number): Promise<Highlight> => {
      const response = await fetch(`${API_URL}/highlights/${id}`);
      if (!response.ok) throw new Error('Failed to fetch highlight');
      return response.json();
    },
    
    // Create a highlight
    create: async (highlight: Highlight): Promise<Highlight> => {
      const response = await fetch(`${API_URL}/highlights`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(highlight)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create highlight');
      }
      
      return response.json();
    },
    
    // Update a highlight
    update: async (id: string | number, highlight: Highlight): Promise<Highlight> => {
      const response = await fetch(`${API_URL}/highlights/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(highlight)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update highlight');
      }
      
      return response.json();
    },
    
    // Delete a highlight
    delete: async (id: string | number): Promise<void> => {
      const response = await fetch(`${API_URL}/highlights/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete highlight');
      }
    }
  },
  
  // Event API
  events: {
    // Get all events
    getAll: async (): Promise<Event[]> => {
      const response = await fetch(`${API_URL}/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
    
    // Get a single event
    getById: async (id: string | number): Promise<Event> => {
      const response = await fetch(`${API_URL}/events/${id}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      return response.json();
    },
    
    // Create an event
    create: async (event: Event): Promise<Event> => {
      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(event)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create event');
      }
      
      return response.json();
    },
    
    // Update an event
    update: async (id: string | number, event: Event): Promise<Event> => {
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(event)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update event');
      }
      
      return response.json();
    },
    
    // Delete an event
    delete: async (id: string | number): Promise<void> => {
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete event');
      }
    }
  },
  
  // Authentication API
  auth: {
    // Login
    login: async (email: string, password: string): Promise<{ token: string, user: User }> => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.token);
      return data;
    },
    
    // Logout
    logout: () => {
      localStorage.removeItem('token');
    },
    
    // Check if authenticated
    isAuthenticated: () => {
      return !!getToken();
    },
    
    // Change password
    changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean, message: string }> => {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }
      
      return response.json();
    }
  },
  
  // File upload API
  upload: {
    // Upload event image
    eventImage: async (file: File): Promise<{ fileUrl: string, fileName: string }> => {
      const formData = new FormData();
      formData.append('eventImage', file);
      
      const response = await fetch(`${API_URL}/upload/event-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload event image');
      }
      
      return response.json();
    },
    
    // Upload highlight image
    highlightImage: async (file: File): Promise<{ fileUrl: string, fileName: string }> => {
      const formData = new FormData();
      formData.append('highlightImage', file);
      
      const response = await fetch(`${API_URL}/upload/highlight-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload highlight image');
      }
      
      return response.json();
    },
    
    // Upload blog image
    blogImage: async (file: File): Promise<{ fileUrl: string, fileName: string }> => {
      const formData = new FormData();
      formData.append('blogImage', file);
      
      const response = await fetch(`${API_URL}/upload/blog-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload blog image');
      }
      
      return response.json();
    },
    
    // Upload icon image
    iconImage: async (file: File): Promise<{ fileUrl: string, fileName: string }> => {
      const formData = new FormData();
      formData.append('iconImage', file);
      
      const response = await fetch(`${API_URL}/upload/icon-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload icon image');
      }
      
      return response.json();
    }
  }
};

export type { Blog, Announcement, Highlight, Event, EventItem, User };
export default api; 