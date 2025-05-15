// Announcement Editor Page 
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import api from '../../api';
import type { Announcement } from '../../api';

const AnnouncementEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== undefined;
  
  const [formData, setFormData] = useState<Announcement>({
    title: '',
    message: '',
    url: '',
    active: true,
    expiresAt: '',
    createdAt: new Date().toISOString()
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载公告数据（编辑模式）
  useEffect(() => {
    if (isEditing && id) {
      const fetchAnnouncement = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const data = await api.announcements.getById(id);
          
          // 格式化日期为YYYY-MM-DD格式，用于日期输入框
          if (data.expiresAt) {
            const expiresDate = new Date(data.expiresAt);
            data.expiresAt = expiresDate.toISOString().split('T')[0];
          }
          
          setFormData(data);
        } catch (err) {
          console.error('Failed to fetch announcement:', err);
          setError('Failed to load announcement data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchAnnouncement();
    }
  }, [isEditing, id]);

  // 处理表单输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    try {
      const announcementData: Announcement = {
        ...formData,
        // 确保日期格式正确
        createdAt: formData.createdAt || new Date().toISOString(),
        // 如果为空字符串，设置为undefined而不是null
        expiresAt: formData.expiresAt || undefined
      };
      
      if (isEditing && id) {
        // 更新现有公告
        await api.announcements.update(id, announcementData);
      } else {
        // 创建新公告
        await api.announcements.create(announcementData);
      }
      
      // 保存成功，返回列表页面
      navigate('/admin/announcements');
    } catch (err) {
      console.error('Failed to save announcement:', err);
      setError('Failed to save announcement. Please check your input and try again.');
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
              {isEditing ? 'Edit Announcement' : 'Create Announcement'}
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
                      <label htmlFor="title" className="form-label required">Title</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="form-input"
                        required
                        placeholder="Enter announcement title"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="message" className="form-label">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        className="form-textarea"
                        placeholder="Enter announcement content"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="url" className="form-label">Link (Optional)</label>
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
                      <label htmlFor="expiresAt" className="form-label">Expiration Date (Optional)</label>
                      <input
                        type="date"
                        id="expiresAt"
                        name="expiresAt"
                        value={formData.expiresAt || ''}
                        onChange={handleChange}
                        className="form-input"
                      />
                      <div className="form-help-text">
                        If set, the announcement will automatically deactivate after this date
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
                        Only active announcements will be displayed to users
                      </div>
                    </div>
                    
                    <div className="form-button-group">
                      <button
                        type="button"
                        onClick={() => navigate('/admin/announcements')}
                        className="form-button form-button-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="form-button form-button-primary"
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Announcement'}
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

export default AnnouncementEditor; 