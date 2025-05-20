import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import api from '../../api';
import type { Event, EventItem as ApiEventItem } from '../../api';

// Add API base URL constant
const API_BASE_URL = '';

interface FormEventItem {
  id?: number;
  eventId?: number;
  iconUrl?: string;
  iconFile: File | null;
  name: string;
  content?: string;
  iconMethod: 'upload' | 'url';
  position?: number;
}

const EventEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Process image URL, add API base URL if it's a relative path
  const getFullImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_BASE_URL}${imageUrl}`;
  };
  
  // Form state
  const [formData, setFormData] = useState<Omit<Event, 'items'>>({
    title: '',
    imageUrl: '',
    summary: '',
    content: '',
    externalLink: '',
    published: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  // Event list items state
  const [eventItems, setEventItems] = useState<FormEventItem[]>([]);
  
  // Image handling
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageMethod, setImageMethod] = useState<'url' | 'upload'>('url');
  const [imageError, setImageError] = useState('');
  
  // Track if form has been modified
  const [isFormDirty, setIsFormDirty] = useState(false);
  
  // Mark form as modified when form state changes
  const markFormAsDirty = useCallback(() => {
    if (!isFormDirty) {
      setIsFormDirty(true);
    }
  }, [isFormDirty]);
  
  // Show confirmation dialog when unmounting if form has unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty && !isSaving) {
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        e.returnValue = message;
        return message;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isFormDirty, isSaving]);
  
  // Form state should be unmodified after initial data load
  useEffect(() => {
    if (isEditing) {
      const fetchEvent = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          const data = await api.events.getById(id!);
          
          // Prepare main form data
          const { items, ...eventData } = data;
          setFormData(eventData);
          setImageMethod(eventData.imageUrl ? 'url' : 'upload');
          
          // Prepare event items
          if (items && items.length > 0) {
            const formattedItems: FormEventItem[] = items.map(item => ({
              id: item.id,
              eventId: item.eventId,
              name: item.name,
              content: item.content || '',
              iconUrl: item.iconUrl || '',
              iconFile: null,
              iconMethod: item.iconUrl ? 'url' : 'upload',
              position: item.position
            }));
            setEventItems(formattedItems);
          }
          
          // 初始加载数据后，表单状态应当是未修改的
          setIsFormDirty(false);
        } catch (err) {
          console.error('Failed to fetch event:', err);
          setError('Failed to load the event. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchEvent();
    }
  }, [isEditing, id]);
  
  // Handle input changes for main form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    markFormAsDirty();
    
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
  
  // Handle image method change
  const handleImageMethodChange = (method: 'url' | 'upload') => {
    markFormAsDirty();
    setImageMethod(method);
    if (method === 'upload') {
      setFormData(prev => ({ ...prev, imageUrl: '' }));
    } else {
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    setImageError('');
  };
  
  // Handle file selection for main image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      markFormAsDirty();
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
      setFormData(prev => ({ ...prev, imageUrl: url }));
    }
  };

  // Handle item icon file change
  const handleItemIconChange = (e: React.ChangeEvent<HTMLInputElement>, itemId: number | string) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      markFormAsDirty();
      const file = files[0];
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should not exceed 2MB');
        return;
      }
      
      // Create a preview URL
      const url = URL.createObjectURL(file);
      
      setEventItems(prev => 
        prev.map(item => 
          (item.id === itemId || (!item.id && itemId === item.name)) 
            ? { ...item, iconUrl: url, iconFile: file } 
            : item
        )
      );
    }
  };
  
  // Handle changes to an event item
  const handleItemChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, 
    itemId: number | string, 
    field: 'name' | 'content' | 'iconUrl'
  ) => {
    markFormAsDirty();
    
    const { value } = e.target;
    
    setEventItems(prev => 
      prev.map(item => 
        (item.id === itemId || (!item.id && itemId === item.name)) 
          ? { ...item, [field]: value } 
          : item
      )
    );
  };
  
  // Add a new event item
  const addEventItem = () => {
    markFormAsDirty();
    
    const newItem: FormEventItem = {
      id: undefined,
      iconUrl: '',
      iconFile: null,
      name: `Item ${eventItems.length + 1}`,
      content: '',
      iconMethod: 'upload',
      position: eventItems.length
    };
    
    setEventItems(prev => [...prev, newItem]);
  };
  
  // Remove an event item
  const removeEventItem = (itemId: number | string) => {
    markFormAsDirty();
    
    if (window.confirm('Are you sure you want to remove this item?')) {
      setEventItems(prev => prev.filter(item => 
        !(item.id === itemId || (!item.id && itemId === item.name))
      ));
    }
  };
  
  // Handle Item icon method change
  const handleItemIconMethodChange = (itemId: number | string, method: 'upload' | 'url') => {
    markFormAsDirty();
    setEventItems(prev => 
      prev.map(item => 
        (item.id === itemId || (!item.id && itemId === item.name))
          ? { 
              ...item, 
              iconMethod: method,
              iconUrl: method === 'upload' ? '' : item.iconUrl
            } 
          : item
      )
    );
  };
  
  // Handle navigation back to list page, show confirmation dialog if there are unsaved changes
  const handleNavigateBack = () => {
    if (isFormDirty && !isSaving) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/admin/events');
      }
    } else {
      navigate('/admin/events');
    }
  };
  
  // If there are image files to upload, handle upload first
  // Form submission
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
    
    // Validate event items
    const invalidItems = eventItems.filter(item => !item.name.trim());
    if (invalidItems.length > 0) {
      alert('All event items must have a name');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // 如果有图片文件需要上传，先处理上传
      let updatedImageUrl = formData.imageUrl;
      if (imageMethod === 'upload' && imageFile) {
        try {
          const uploadResult = await api.upload.eventImage(imageFile);
          updatedImageUrl = uploadResult.fileUrl;
        } catch (err) {
          console.error('Failed to upload event image:', err);
          setError('Failed to upload image. Please try again.');
          setIsSaving(false);
          return;
        }
      }
      
      // 处理每个事件项的图标上传
      const processedItems = await Promise.all(
        eventItems.map(async (item, index) => {
          // 如果有图标文件需要上传
          if (item.iconMethod === 'upload' && item.iconFile) {
            try {
              const uploadResult = await api.upload.iconImage(item.iconFile);
              return {
                id: item.id,
                name: item.name,
                content: item.content || undefined,
                iconUrl: uploadResult.fileUrl,
                position: index
              };
            } catch (err) {
              console.error(`Failed to upload icon for item ${item.name}:`, err);
              throw new Error(`Failed to upload icon for "${item.name}". Please try again.`);
            }
          } else {
            return {
              id: item.id,
              name: item.name,
              content: item.content || undefined,
              iconUrl: item.iconUrl || undefined,
              position: index
            };
          }
        })
      );
      
      // 准备事件数据
      const eventData: Event = {
        ...formData,
        imageUrl: updatedImageUrl,
        updatedAt: new Date().toISOString(),
        items: processedItems as ApiEventItem[]
      };
      
      if (!isEditing) {
        eventData.createdAt = new Date().toISOString();
      }
      
      // 保存事件
      if (isEditing && id) {
        await api.events.update(id, eventData);
      } else {
        await api.events.create(eventData);
      }
      
      // 表单提交成功后，重置表单状态
      setIsFormDirty(false);
      
      // 显示成功消息
      alert(`Event ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // 导航回列表页面
      navigate('/admin/events');
    } catch (err) {
      console.error('Failed to save event:', err);
      setError(typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Failed to save the event. Please try again.'));
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
              {isEditing ? 'Edit Event' : 'Create New Event'}
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
                      <label htmlFor="title" className="form-label required">Title</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Event title"
                        disabled={isSaving}
                      />
                    </div>
                    
                    {/* Image input */}
                    <div className="form-group">
                      <label className="form-label required">Image</label>
                      
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
                            disabled={isSaving}
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
                            disabled={isSaving}
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
                            disabled={isSaving}
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
                            disabled={isSaving}
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
                      <label htmlFor="summary" className="form-label required">Button Content</label>
                      <textarea
                        id="summary"
                        name="summary"
                        rows={2}
                        required
                        value={formData.summary}
                        onChange={handleChange}
                        className="form-textarea"
                        placeholder="A brief summary of the event"
                        disabled={isSaving}
                      />
                    </div>
                    
                    {/* Content input */}
                    <div className="form-group">
                      <label htmlFor="content" className="form-label">Content</label>
                      <textarea
                        id="content"
                        name="content"
                        rows={8}
                        value={formData.content || ''}
                        onChange={handleChange}
                        className="form-textarea"
                        placeholder="Full content or description of the event"
                        disabled={isSaving}
                      />
                    </div>
                    
                    {/* External link input */}
                    <div className="form-group">
                      <label htmlFor="externalLink" className="form-label">External Link (Optional)</label>
                      <input
                        type="url"
                        id="externalLink"
                        name="externalLink"
                        value={formData.externalLink || ''}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="https://example.com/event-details"
                        disabled={isSaving}
                      />
                      <p className="form-help-text">
                        Add a link to registration page or more information
                      </p>
                    </div>
                    
                    {/* Event items section */}
                    <div className="form-group">
                      <div className="flex justify-between items-center mb-4">
                        <label className="form-label">Event Items</label>
                        <button
                          type="button"
                          onClick={addEventItem}
                          className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:bg-indigo-300"
                          disabled={isSaving}
                        >
                          Add Item
                        </button>
                      </div>
                      
                      {eventItems.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
                          <p className="text-gray-500">No items added yet</p>
                          <button
                            type="button"
                            onClick={addEventItem}
                            className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 bg-white rounded-md border border-indigo-300 hover:bg-indigo-50 disabled:bg-gray-100 disabled:text-gray-400"
                            disabled={isSaving}
                          >
                            Add First Item
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {eventItems.map((item, index) => {
                            const itemKey = item.id || item.name;
                            return (
                              <div key={itemKey} className="p-4 bg-gray-50 rounded-md border border-gray-200">
                                <div className="flex justify-between items-start mb-4">
                                  <h3 className="text-lg font-medium">Item {index + 1}</h3>
                                  <button
                                    type="button"
                                    onClick={() => removeEventItem(itemKey)}
                                    className="px-2 py-1 text-xs font-medium text-red-600 rounded hover:bg-red-100 disabled:text-red-300"
                                    disabled={isSaving}
                                  >
                                    Remove
                                  </button>
                                </div>
                                
                                <div className="space-y-4">
                                  {/* Item name */}
                                  <div>
                                    <label htmlFor={`item-name-${itemKey}`} className="block text-sm font-medium text-gray-700 required">
                                      Name
                                    </label>
                                    <input
                                      type="text"
                                      id={`item-name-${itemKey}`}
                                      value={item.name}
                                      onChange={(e) => handleItemChange(e, itemKey, 'name')}
                                      required
                                      className="form-input mt-1"
                                      placeholder="Item name"
                                      disabled={isSaving}
                                    />
                                  </div>
                                  
                                  {/* Item content */}
                                  <div>
                                    <label htmlFor={`item-content-${itemKey}`} className="block text-sm font-medium text-gray-700">
                                      Content
                                    </label>
                                    <textarea
                                      id={`item-content-${itemKey}`}
                                      value={item.content || ''}
                                      onChange={(e) => handleItemChange(e, itemKey, 'content')}
                                      className="form-textarea mt-1"
                                      rows={2}
                                      placeholder="Item description or content"
                                      disabled={isSaving}
                                    />
                                  </div>
                                  
                                  {/* Item icon */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      Icon
                                    </label>
                                    
                                    <div className="mt-1 flex space-x-4">
                                      <div>
                                        <input
                                          type="radio"
                                          id={`icon-method-url-${itemKey}`}
                                          checked={item.iconMethod === 'url'}
                                          onChange={() => handleItemIconMethodChange(itemKey, 'url')}
                                          className="form-radio"
                                          disabled={isSaving}
                                        />
                                        <label htmlFor={`icon-method-url-${itemKey}`} className="ml-2 text-sm text-gray-700">
                                          Icon URL
                                        </label>
                                      </div>
                                      
                                      <div>
                                        <input
                                          type="radio"
                                          id={`icon-method-upload-${itemKey}`}
                                          checked={item.iconMethod === 'upload'}
                                          onChange={() => handleItemIconMethodChange(itemKey, 'upload')}
                                          className="form-radio"
                                          disabled={isSaving}
                                        />
                                        <label htmlFor={`icon-method-upload-${itemKey}`} className="ml-2 text-sm text-gray-700">
                                          Upload Icon
                                        </label>
                                      </div>
                                    </div>
                                    
                                    {item.iconMethod === 'url' ? (
                                      <input
                                        type="url"
                                        id={`icon-url-${itemKey}`}
                                        value={item.iconUrl || ''}
                                        onChange={(e) => handleItemChange(e, itemKey, 'iconUrl')}
                                        className="form-input mt-2"
                                        placeholder="https://example.com/icon.png"
                                        disabled={isSaving}
                                      />
                                    ) : (
                                      <input
                                        type="file"
                                        id={`icon-file-${itemKey}`}
                                        onChange={(e) => handleItemIconChange(e, itemKey)}
                                        accept="image/*"
                                        className="form-file-input mt-2"
                                        disabled={isSaving}
                                      />
                                    )}
                                    
                                    {item.iconUrl && (
                                      <div className="mt-2 flex items-center">
                                        <img
                                          src={getFullImageUrl(item.iconUrl)}
                                          alt={`Icon for ${item.name}`}
                                          className="w-10 h-10 object-contain bg-white rounded border border-gray-200"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = 'https://via.placeholder.com/40?text=Icon';
                                          }}
                                        />
                                        <span className="ml-2 text-xs text-gray-500">Icon preview</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    {/* Published toggle */}
                    <div className="form-group">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="published"
                          name="published"
                          checked={formData.published}
                          onChange={handleChange}
                          className="form-checkbox"
                          disabled={isSaving}
                        />
                        <label htmlFor="published" className="form-check-label">
                          Published
                        </label>
                      </div>
                      <p className="form-help-text">
                        If checked, the event will be visible to users
                      </p>
                    </div>
                    
                    {/* Form buttons */}
                    <div className="form-button-group">
                      <button
                        type="button"
                        onClick={handleNavigateBack}
                        className="form-button form-button-secondary"
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="form-button form-button-primary"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </span>
                        ) : 'Save Event'}
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

export default EventEditor; 