// API configuration
const API_URL = '/api';

// Helper functions for API requests
export const api = {
  // Base fetch with authorization header
  fetch: async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    
    const config = {
      ...options,
      headers,
    };
    
    return fetch(`${API_URL}${endpoint}`, config);
  },
  
  // GET request
  get: async (endpoint: string) => {
    const response = await api.fetch(endpoint);
    return response.json();
  },
  
  // POST request with JSON body
  post: async (endpoint: string, data: any) => {
    const response = await api.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  // PUT request with JSON body
  put: async (endpoint: string, data: any) => {
    const response = await api.fetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  // DELETE request
  delete: async (endpoint: string) => {
    const response = await api.fetch(endpoint, {
      method: 'DELETE',
    });
    return response.json();
  },
};

export default api; 