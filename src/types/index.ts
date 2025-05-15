// Type definitions
export interface Blog {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
}

export interface Announcement {
  id: string;
  message: string;
  active: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface User {
  id: string;
  email: string;
  role: 'admin';
  createdAt: Date;
} 