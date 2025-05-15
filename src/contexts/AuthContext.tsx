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

// 定义认证上下文类型
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | null>(null);

// API基础URL
const API_URL = '/api';

// 创建认证提供者组件
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 验证令牌并加载用户数据
  useEffect(() => {
    const verifyToken = async () => {
      try {
        // 检查是否已有令牌
        if (!api.auth.isAuthenticated()) {
          setIsLoading(false);
          return;
        }

        // 验证令牌
        const response = await fetch(`${API_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        
        if (data.valid && data.user) {
          setUser(data.user);
        } else {
          // 清除无效令牌
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

  // 登录方法
  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login(email, password) as LoginResponse;
      // 从响应中获取用户信息
      if (response && response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // 登出方法
  const logout = () => {
    api.auth.logout();
    setUser(null);
  };

  // 传递认证状态和方法
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定义hook，方便使用认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 