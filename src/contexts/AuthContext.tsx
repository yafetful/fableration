import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../api';

// 定义用户类型
interface User {
  id: number;
  email: string;
  role: string;
}

// API登录响应类型
interface LoginResponse {
  token: string;
  user: User;
}

// Define authentication context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create authentication context
const AuthContext = createContext<AuthContextType | null>(null);

// API基础URL
const API_URL = '/api';

// Create authentication provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verify token and load user data
  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Check if token is already present
        if (!api.auth.isAuthenticated()) {
          setIsLoading(false);
          return;
        }

        // Verify token
        const response = await fetch(`${API_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        
        if (data.valid && data.user) {
          setUser(data.user);
        } else {
          // Clear invalid token
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Login method
  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login(email, password) as LoginResponse;
      // Get user information from response
      if (response && response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout method
  const logout = () => {
    api.auth.logout();
    setUser(null);
  };

  // Pass authentication status and methods
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for easy access to authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 