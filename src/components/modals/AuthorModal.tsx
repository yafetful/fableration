import React, { useState, useEffect } from 'react';
import api from '../../api';
import type { Author } from '../../api';

// Helper function from BlogEditor.tsx or a shared utility
const API_BASE_URL = ''; // Adjust if your API base is different or not needed for absolute URLs
const getFullImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http') || imageUrl.startsWith('blob:')) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
};

interface AuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthorCreated: (author: Author) => void;
}

const AuthorModal: React.FC<AuthorModalProps> = ({ isOpen, onClose, onAuthorCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    avatarUrl: '', // Will store the final URL (entered or from upload)
    bio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [authorAvatarFile, setAuthorAvatarFile] = useState<File | null>(null);
  const [authorAvatarMethod, setAuthorAvatarMethod] = useState<'url' | 'upload'>('url');
  const [authorAvatarError, setAuthorAvatarError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', avatarUrl: '', bio: '' });
      setAuthorAvatarFile(null);
      setAuthorAvatarMethod('url');
      setError(null);
      setAuthorAvatarError('');
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'avatarUrl') {
      setAuthorAvatarError('');
    }
  };

  const handleAuthorAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        setAuthorAvatarError('Please select an image file.');
        setAuthorAvatarFile(null);
        setFormData(prev => ({ ...prev, avatarUrl: '' })); 
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for avatars
        setAuthorAvatarError('Avatar image size should not exceed 2MB.');
        setAuthorAvatarFile(null);
        setFormData(prev => ({ ...prev, avatarUrl: '' }));
        return;
      }
      setAuthorAvatarFile(file);
      setAuthorAvatarError('');
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatarUrl: previewUrl })); // Use object URL for preview
    }
  };

  const handleAuthorAvatarMethodChange = (method: 'url' | 'upload') => {
    setAuthorAvatarMethod(method);
    setAuthorAvatarError('');
    setAuthorAvatarFile(null);
    if (method === 'upload') {
        setFormData(prev => ({ ...prev, avatarUrl: '' }));
    } else if (authorAvatarMethod === 'upload') { // Switching from upload to URL
        setFormData(prev => ({ ...prev, avatarUrl: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Author name is required');
      return;
    }

    if (authorAvatarMethod === 'upload' && !authorAvatarFile) {
      // setAuthorAvatarError('Please upload an avatar image or provide a URL.');
      // return; // Avatar is optional, so allow submit if file is not there but method is upload
    }

    setIsSubmitting(true);
    setError(null);
    setAuthorAvatarError('');

    let finalAvatarUrl = formData.avatarUrl;

    try {
      if (authorAvatarMethod === 'upload' && authorAvatarFile) {
        // Using api.upload.blogImage as placeholder for avatar uploads
        const uploadResult = await api.upload.blogImage(authorAvatarFile);
        finalAvatarUrl = uploadResult.fileUrl;
      }

      const authorDataToSave = {
        ...formData,
        avatarUrl: finalAvatarUrl ? finalAvatarUrl : undefined, // Ensure undefined if empty
      };

      const newAuthor = await api.authors.create(authorDataToSave as Author);
      onAuthorCreated(newAuthor);
      onClose(); // State reset is handled by useEffect
    } catch (err: any) {
      console.error("Error creating author:", err);
      setError(err.message || 'Failed to create author. Check console.');
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Create New Author</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-600 text-sm rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
              Author Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="authorName"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter author name"
              required
            />
          </div>

          {/* Author Avatar URL or Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar Image (Optional)</label>
            <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center">
                    <input type="radio" id="authorAvatarMethodUrl" name="authorAvatarMethod" value="url" checked={authorAvatarMethod === 'url'} onChange={() => handleAuthorAvatarMethodChange('url')} className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"/>
                    <label htmlFor="authorAvatarMethodUrl" className="ml-2 text-sm text-gray-700">URL</label>
                </div>
                <div className="flex items-center">
                    <input type="radio" id="authorAvatarMethodUpload" name="authorAvatarMethod" value="upload" checked={authorAvatarMethod === 'upload'} onChange={() => handleAuthorAvatarMethodChange('upload')} className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"/>
                    <label htmlFor="authorAvatarMethodUpload" className="ml-2 text-sm text-gray-700">Upload</label>
                </div>
            </div>

            {authorAvatarMethod === 'url' && (
              <input
                type="url"
                id="authorAvatarUrlInput"
                name="avatarUrl" 
                value={formData.avatarUrl}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${authorAvatarError ? 'border-red-500' : ''}`}
                placeholder="https://example.com/avatar.jpg"
              />
            )}

            {authorAvatarMethod === 'upload' && (
              <input
                type="file"
                id="authorAvatarFileInput"
                name="authorAvatarFile"
                accept="image/*"
                onChange={handleAuthorAvatarFileChange}
                className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 ${authorAvatarError ? 'border border-red-500 rounded-md p-1' : ''}`}
              />
            )}
            {authorAvatarError && <p className="mt-1 text-xs text-red-600">{authorAvatarError}</p>}
            
            {/* Avatar Preview */}
            {formData.avatarUrl && (
                <div className="mt-3">
                    <p className="text-xs font-medium text-gray-600 mb-1">Preview:</p>
                    <img 
                        src={getFullImageUrl(formData.avatarUrl)} 
                        alt="Avatar Preview" 
                        className="h-20 w-20 rounded-full border border-gray-200 object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                </div>
            )}
          </div>

          <div>
            <label htmlFor="authorBio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio (Optional)
            </label>
            <textarea
              id="authorBio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="A short bio for the author"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 mt-2 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60">
              {isSubmitting ? 'Creating...' : 'Create Author'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthorModal; 