// API通信接口
const API_URL = '/api';

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

// 获取身份验证令牌
const getToken = () => localStorage.getItem('token');

// 创建带有身份验证的请求头
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// API请求处理器
const api = {
  // 博客API
  blogs: {
    // 获取所有博客
    getAll: async (): Promise<Blog[]> => {
      const response = await fetch(`${API_URL}/blogs`);
      if (!response.ok) throw new Error('Failed to fetch blogs');
      return response.json();
    },
    
    // 获取单个博客
    getById: async (id: string | number): Promise<Blog> => {
      const response = await fetch(`${API_URL}/blogs/${id}`);
      if (!response.ok) throw new Error('Failed to fetch blog');
      return response.json();
    },
    
    // 创建博客
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
    
    // 更新博客
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
    
    // 删除博客
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
  
  // 公告API
  announcements: {
    // 获取所有公告
    getAll: async (): Promise<Announcement[]> => {
      const response = await fetch(`${API_URL}/announcements`);
      if (!response.ok) throw new Error('Failed to fetch announcements');
      return response.json();
    },
    
    // 获取活跃公告
    getActive: async (): Promise<Announcement[]> => {
      const response = await fetch(`${API_URL}/announcements/active`);
      if (!response.ok) throw new Error('Failed to fetch active announcements');
      return response.json();
    },
    
    // 获取单个公告
    getById: async (id: string | number): Promise<Announcement> => {
      const response = await fetch(`${API_URL}/announcements/${id}`);
      if (!response.ok) throw new Error('Failed to fetch announcement');
      return response.json();
    },
    
    // 创建公告
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
    
    // 更新公告
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
    
    // 删除公告
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
  
  // 亮点API
  highlights: {
    // 获取所有亮点
    getAll: async (): Promise<Highlight[]> => {
      const response = await fetch(`${API_URL}/highlights`);
      if (!response.ok) throw new Error('Failed to fetch highlights');
      return response.json();
    },
    
    // 获取活跃亮点
    getActive: async (): Promise<Highlight[]> => {
      const response = await fetch(`${API_URL}/highlights/active`);
      if (!response.ok) throw new Error('Failed to fetch active highlights');
      return response.json();
    },
    
    // 获取单个亮点
    getById: async (id: string | number): Promise<Highlight> => {
      const response = await fetch(`${API_URL}/highlights/${id}`);
      if (!response.ok) throw new Error('Failed to fetch highlight');
      return response.json();
    },
    
    // 创建亮点
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
    
    // 更新亮点
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
    
    // 删除亮点
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
  
  // 事件API
  events: {
    // 获取所有事件
    getAll: async (): Promise<Event[]> => {
      const response = await fetch(`${API_URL}/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
    
    // 获取单个事件
    getById: async (id: string | number): Promise<Event> => {
      const response = await fetch(`${API_URL}/events/${id}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      return response.json();
    },
    
    // 创建事件
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
    
    // 更新事件
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
    
    // 删除事件
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
  
  // 身份验证API
  auth: {
    // 登录
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
    
    // 登出
    logout: () => {
      localStorage.removeItem('token');
    },
    
    // 检查是否已认证
    isAuthenticated: () => {
      return !!getToken();
    },
    
    // 修改密码
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
  
  // 文件上传API
  upload: {
    // 上传事件图片
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
    
    // 上传亮点图片
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
    
    // 上传博客图片
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
    
    // 上传图标图片
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