// Highlight Editor Page 
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import api from '../../api';
import type { Highlight } from '../../api';

const HighlightEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== 'new' && id !== undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageMethod, setImageMethod] = useState<'url' | 'upload'>('url');

  // Form data state
  const [formData, setFormData] = useState<Highlight>({
    title: '',
    imageUrl: '',
    url: '',
    type: 'image',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load highlight data (edit mode)
  useEffect(() => {
    if (isEditing && id) {
      const fetchHighlight = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const data = await api.highlights.getById(id);
          
          setFormData(data);
          
          // If there's an image URL, set it as preview
          if (data.imageUrl) {
            setImagePreview(data.imageUrl);
            setImageMethod('url');
          }
        } catch (err) {
          console.error('Failed to fetch highlight:', err);
          setError('Failed to load highlight data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchHighlight();
    }
  }, [isEditing, id]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else if (name === 'type') {
      // 处理类型变更
      const newType = value;
      
      // 如果从视频切换到图片，处理内容换行
      if (formData.type === 'video' && newType === 'image') {
        const singleLine = formData.title.replace(/\\n/g, ' ').replace(/\n/g, ' ');
        setFormData(prev => ({
          ...prev,
          type: newType,
          title: singleLine
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          type: newType
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle image URL change
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, imageUrl: url }));
    
    if (url) {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please upload an image file');
      return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image size should be less than 2MB');
      return;
    }
    
    setImageFile(file);
    setImageError(null);
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Toggle image method
  const toggleImageMethod = (method: 'url' | 'upload') => {
    setImageMethod(method);
    if (method === 'url') {
      setImageFile(null);
      setImagePreview(formData.imageUrl || null);
    } else {
      setFormData(prev => ({ ...prev, imageUrl: '' }));
      setImagePreview(null);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate image is present
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
      // If we have an image file to upload, handle that first
      let updatedImageUrl = formData.imageUrl;
      if (imageMethod === 'upload' && imageFile) {
        try {
          // 使用highlight专用的图片上传API
          const uploadResult = await api.upload.highlightImage(imageFile);
          updatedImageUrl = uploadResult.fileUrl;
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          setError('Failed to upload image. Please try again.');
          setIsSaving(false);
          return;
        }
      }
      
      // 处理标题/内容中的换行符
      const processedTitle = formData.type === 'video' 
        ? formData.title.replace(/\r?\n/g, '\\n') 
        : formData.title;
      
      const highlightData: Highlight = {
        ...formData,
        title: processedTitle,
        imageUrl: updatedImageUrl,
        updatedAt: new Date().toISOString()
      };
      
      if (isEditing && id) {
        // Update existing highlight
        await api.highlights.update(id, highlightData);
      } else {
        // Create new highlight
        await api.highlights.create(highlightData);
      }
      
      // Save successful, return to list page
      navigate('/admin/highlights');
    } catch (err) {
      console.error('Failed to save highlight:', err);
      setError('Failed to save highlight. Please check your input and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow">
          <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Highlight' : 'Create Highlight'}
            </h1>
          </div>
        </header>
        
        <main>
          <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              {isLoading ? (
                <div className="flex items-center justify-center p-6">
                  <svg className="w-8 h-8 mr-2 text-indigo-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="dashboard-form-container">
                  {error && (
                    <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="title" className="form-label required">
                        {formData.type === 'video' ? 'Content' : 'Title'}
                      </label>
                      {formData.type === 'video' ? (
                        <textarea
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          className="form-input"
                          required
                          placeholder="Enter video content"
                          rows={4}
                        />
                      ) : (
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          className="form-input"
                          required
                          placeholder="Enter highlight title"
                        />
                      )}
                      <div className="form-help-text">
                        {formData.type === 'video' 
                          ? 'Content supports multiple lines for video descriptions' 
                          : 'Enter a concise highlight title'}
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="type" className="form-label">Type</label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type || 'image'}
                        onChange={handleChange}
                        className="form-input"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                      <div className="form-help-text">
                        Select the type of highlight - changes form fields
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label required">Image</label>
                      
                      <div className="mb-4">
                        <div className="flex mt-2 space-x-4">
                          <div 
                            className={`cursor-pointer px-4 py-2 rounded-md ${imageMethod === 'url' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100'}`}
                            onClick={() => toggleImageMethod('url')}
                          >
                            Image URL
                          </div>
                          <div 
                            className={`cursor-pointer px-4 py-2 rounded-md ${imageMethod === 'upload' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100'}`}
                            onClick={() => toggleImageMethod('upload')}
                          >
                            Upload Image
                          </div>
                        </div>
                      </div>
                      
                      {imageMethod === 'url' ? (
                        <div>
                          <input
                            type="url"
                            id="imageUrl"
                            name="imageUrl"
                            value={formData.imageUrl || ''}
                            onChange={handleImageUrlChange}
                            className="form-input"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            id="imageUpload"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Select Image
                          </button>
                          {imageFile && (
                            <span className="ml-3 text-sm text-gray-500">
                              {imageFile.name}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {imageError && (
                        <div className="mt-2 text-sm text-red-600">
                          {imageError}
                        </div>
                      )}
                      
                      {imagePreview && (
                        <div className="mt-4">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="object-cover w-full h-48 rounded-md md:h-64"
                            onError={() => setImageError('Failed to load image. Please check the URL.')}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="url" className="form-label">Link URL (Optional)</label>
                      <input
                        type="url"
                        id="url"
                        name="url"
                        value={formData.url || ''}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="https://example.com"
                      />
                      <div className="form-help-text">
                        Add a link for users to click for more information
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="active"
                          name="active"
                          checked={formData.active}
                          onChange={handleChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="active" className="form-check-label">
                          Active
                        </label>
                      </div>
                      <div className="form-help-text">
                        Only active highlights will be displayed to users
                      </div>
                    </div>
                    
                    <div className="form-button-group">
                      <button
                        type="button"
                        onClick={() => navigate('/admin/highlights')}
                        className="form-button form-button-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="form-button form-button-primary"
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Highlight'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HighlightEditor; 