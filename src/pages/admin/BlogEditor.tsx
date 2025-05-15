import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import api from '../../api';
import type { Blog } from '../../api';

// 添加API基础URL常量
const API_BASE_URL = 'http://localhost:3001';

const categories = ['Blogs', 'News', 'Events'];

// 处理图片URL，如果是相对路径则加上API基础URL
const getFullImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
};

const BlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState<Blog>({
    title: '',
    content: '',
    summary: '',
    category: 'Blogs',
    imageUrl: '',
    externalLink: '',
    published: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageMethod, setImageMethod] = useState<'url' | 'upload'>('url');
  const [imageError, setImageError] = useState('');
  
  // Load blog data
  useEffect(() => {
    if (isEditing) {
      const fetchBlog = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const blog = await api.blogs.getById(id!);
          setFormData(blog);
          setImageMethod(blog.imageUrl ? 'url' : 'upload');
        } catch (err) {
          console.error('Failed to fetch blog:', err);
          setError('Failed to load the blog post. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchBlog();
    }
  }, [id, isEditing]);
  
  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setImageError('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Image size should not exceed 5MB');
        return;
      }
      
      setImageFile(file);
      setImageError('');
      
      // Create a preview URL
      const url = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        imageUrl: url
      }));
    }
  };
  
  // Handle image method change
  const handleImageMethodChange = (method: 'url' | 'upload') => {
    setImageMethod(method);
    if (method === 'upload') {
      setFormData(prev => ({
        ...prev,
        imageUrl: ''
      }));
    } else {
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    setImageError('');
  };
  
  // Save blog
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate image is present if required
    if (imageMethod === 'url' && !formData.imageUrl) {
      setImageError('Please provide an image URL');
      return;
    }
    
    if (imageMethod === 'upload' && !imageFile && !formData.imageUrl) {
      setImageError('Please upload an image');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // 如果有图片文件需要上传，先处理上传
      let updatedImageUrl = formData.imageUrl;
      if (imageMethod === 'upload' && imageFile) {
        try {
          const uploadResult = await api.upload.blogImage(imageFile);
          updatedImageUrl = uploadResult.fileUrl;
        } catch (err) {
          console.error('Failed to upload blog image:', err);
          setError('Failed to upload image. Please try again.');
          setIsSaving(false);
          return;
        }
      }
      
      // Prepare blog data
      const blogData: Blog = {
        ...formData,
        imageUrl: updatedImageUrl,
        updatedAt: new Date().toISOString()
      };
      
      if (!isEditing) {
        blogData.createdAt = new Date().toISOString();
      }
      
      // Save blog
      if (isEditing) {
        await api.blogs.update(id!, blogData);
      } else {
        await api.blogs.create(blogData);
      }
      
      navigate('/admin/blogs');
    } catch (err) {
      console.error('Failed to save blog:', err);
      setError('Failed to save the blog post. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow">
          <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Post' : 'Create New Post'}
            </h1>
          </div>
        </header>
        
        <main>
          <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="dashboard-form-container">
              {isLoading ? (
                <div className="flex items-center justify-center p-12">
                  <svg className="w-8 h-8 mr-2 text-indigo-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading...</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    {/* Title input */}
                    <div className="form-group">
                      <label htmlFor="title" className="form-label required">
                        Title
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="title"
                          id="title"
                          required
                          value={formData.title}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Post title"
                        />
                      </div>
                    </div>
                    
                    {/* Image input */}
                    <div className="form-group">
                      <label className="form-label required">
                        Image
                      </label>
                      
                      {/* Image method selection */}
                      <div className="image-upload-options">
                        <div className="image-upload-option">
                          <input
                            type="radio"
                            id="imageMethodUrl"
                            name="imageMethod"
                            className="form-radio"
                            checked={imageMethod === 'url'}
                            onChange={() => handleImageMethodChange('url')}
                          />
                          <label htmlFor="imageMethodUrl" className="form-check-label">
                            Image URL
                          </label>
                        </div>
                        
                        <div className="image-upload-option">
                          <input
                            type="radio"
                            id="imageMethodUpload"
                            name="imageMethod"
                            className="form-radio"
                            checked={imageMethod === 'upload'}
                            onChange={() => handleImageMethodChange('upload')}
                          />
                          <label htmlFor="imageMethodUpload" className="form-check-label">
                            Upload Image
                          </label>
                        </div>
                      </div>
                      
                      {/* URL input */}
                      {imageMethod === 'url' && (
                        <div className="mt-2">
                          <input
                            type="url"
                            name="imageUrl"
                            id="imageUrl"
                            value={formData.imageUrl || ''}
                            onChange={handleChange}
                            className={`form-input ${imageError ? 'error' : ''}`}
                            placeholder="https://example.com/image.jpg"
                            required
                          />
                          <p className="form-help-text">
                            Enter a direct URL to an image (JPEG, PNG, etc.)
                          </p>
                        </div>
                      )}
                      
                      {/* File upload input */}
                      {imageMethod === 'upload' && (
                        <div className="mt-2">
                          <input
                            type="file"
                            name="imageFile"
                            id="imageFile"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className={`form-file-input ${imageError ? 'error' : ''}`}
                          />
                          <p className="form-help-text">
                            Maximum file size: 5MB. Supported formats: JPEG, PNG, GIF.
                          </p>
                        </div>
                      )}
                      
                      {/* Image preview */}
                      {formData.imageUrl && (
                        <div className="mt-4">
                          <p className="mb-2 text-sm font-medium text-gray-700">Image Preview:</p>
                          <img 
                            src={getFullImageUrl(formData.imageUrl)} 
                            alt="Preview" 
                            className="object-cover w-full h-40 rounded-md"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = 'https://via.placeholder.com/800x400?text=Error+Loading+Image';
                            }}
                          />
                        </div>
                      )}
                      
                      {imageError && <p className="mt-2 text-sm text-red-600">{imageError}</p>}
                    </div>
                    
                    {/* Summary input */}
                    <div className="form-group">
                      <label htmlFor="summary" className="form-label required">
                        Summary
                      </label>
                      <div className="mt-1">
                        <textarea
                          name="summary"
                          id="summary"
                          rows={2}
                          required
                          value={formData.summary}
                          onChange={handleChange}
                          className="form-textarea"
                          placeholder="A brief summary of the post"
                        />
                      </div>
                    </div>
                    
                    {/* Content input */}
                    <div className="form-group">
                      <label htmlFor="content" className="form-label">
                        Content
                      </label>
                      <div className="mt-1">
                        <textarea
                          name="content"
                          id="content"
                          rows={10}
                          value={formData.content || ''}
                          onChange={handleChange}
                          className="form-textarea"
                          placeholder="Full post content"
                        />
                      </div>
                    </div>
                    
                    {/* Category input */}
                    <div className="form-group">
                      <label htmlFor="category" className="form-label required">
                        Category
                      </label>
                      <div className="mt-1">
                        <select
                          name="category"
                          id="category"
                          required
                          value={formData.category}
                          onChange={handleChange}
                          className="form-select"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* External link input */}
                    <div className="form-group">
                      <label htmlFor="externalLink" className="form-label">
                        External Link (Optional)
                      </label>
                      <div className="mt-1">
                        <input
                          type="url"
                          name="externalLink"
                          id="externalLink"
                          value={formData.externalLink || ''}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="https://example.com/related-content"
                        />
                      </div>
                      <p className="form-help-text">
                        Add a link to related content or an external article
                      </p>
                    </div>
                    
                    {/* Published toggle */}
                    <div className="form-group">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="published"
                          id="published"
                          checked={formData.published}
                          onChange={handleChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="published" className="form-check-label">
                          Published
                        </label>
                      </div>
                      <p className="form-help-text">
                        If checked, the post will be visible to users
                      </p>
                    </div>
                    
                    {/* Form buttons */}
                    <div className="form-button-group">
                      <button
                        type="button"
                        onClick={() => navigate('/admin/blogs')}
                        className="form-button form-button-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="form-button form-button-primary"
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Post'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BlogEditor; 