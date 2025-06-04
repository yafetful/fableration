import React, { useState, useEffect } from 'react';
import api from '../../api';
import type { Logo } from '../../api';

// Helper function from BlogEditor.tsx or a shared utility
const API_BASE_URL = ''; // Adjust if your API base is different or not needed for absolute URLs
const getFullImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http') || imageUrl.startsWith('blob:')) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
};

interface LogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoCreated: (logo: Logo) => void;
  // existingLogo?: Logo | null; // Future: for editing logos
}

const LogoModal: React.FC<LogoModalProps> = ({ isOpen, onClose, onLogoCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '', // This will store the final URL (either entered or from upload)
    date: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoMethod, setLogoMethod] = useState<'url' | 'upload'>('url');
  const [logoUrlError, setLogoUrlError] = useState('');

  // Reset form when modal opens or closes, or after submit
  useEffect(() => {
    if (isOpen) {
      // Reset form fields and errors when modal becomes visible
      setFormData({ name: '', logoUrl: '', date: '' });
      setLogoFile(null);
      setLogoMethod('url');
      setError(null);
      setLogoUrlError('');
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'logoUrl') {
      setLogoUrlError(''); // Clear error if user types in URL field
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        setLogoUrlError('Please select an image file.');
        setLogoFile(null);
        setFormData(prev => ({ ...prev, logoUrl: '' }));
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for logos
        setLogoUrlError('Logo image size should not exceed 2MB.');
        setLogoFile(null);
        setFormData(prev => ({ ...prev, logoUrl: '' }));
        return;
      }
      setLogoFile(file);
      setLogoUrlError('');
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, logoUrl: previewUrl })); // Use object URL for preview
    }
  };

  const handleLogoMethodChange = (method: 'url' | 'upload') => {
    setLogoMethod(method);
    setLogoUrlError('');
    setLogoFile(null); // Clear file when switching method
    // Clear existing formData.logoUrl unless it was from a previous URL input and method switched back to URL
    if (method === 'upload') {
        setFormData(prev => ({ ...prev, logoUrl: '' })); 
    } else if (logoMethod === 'upload') { // if switching from upload to URL, clear preview
        setFormData(prev => ({ ...prev, logoUrl: '' })); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Logo name is required');
      return;
    }

    // Validate logo image if method is URL and no URL, or if method is upload and no file
    if (logoMethod === 'url' && !formData.logoUrl.trim()) {
      // If URL is selected but field is empty, it's optional, so proceed unless you want to make it required
      // setLogoUrlError('Please provide a logo URL or upload an image.');
      // return;
    } else if (logoMethod === 'upload' && !logoFile) {
      setLogoUrlError('Please upload a logo image or provide a URL.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setLogoUrlError('');

    let finalLogoUrl = formData.logoUrl;

    try {
      if (logoMethod === 'upload' && logoFile) {
        // Using api.upload.blogImage as discussed, replace if a more specific uploader exists
        const uploadResult = await api.upload.blogImage(logoFile);
        finalLogoUrl = uploadResult.fileUrl;
      }

      const logoDataToSave = {
        ...formData,
        logoUrl: finalLogoUrl ? finalLogoUrl : undefined, // Ensure undefined if empty or null
      };

      const newLogo = await api.logos.create(logoDataToSave as Logo); // Assert type if necessary
      onLogoCreated(newLogo);
      // Resetting state is now handled by useEffect based on isOpen
      onClose(); 
    } catch (err: any) {
      console.error("Error creating logo:", err);
      setError(err.message || 'Failed to create logo. Check console for details.');
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
          <h2 className="text-xl font-semibold text-gray-800">Create New Logo</h2>
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
            <label htmlFor="logoName" className="block text-sm font-medium text-gray-700 mb-1">
              Logo Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="logoName"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter logo name"
              required
            />
          </div>

          {/* Logo Image URL or Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo Image (Optional)</label>
            <div className="flex items-center space-x-4 mb-2">
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="logoMethodUrl" 
                  name="logoMethod" 
                  value="url" 
                  checked={logoMethod === 'url'} 
                  onChange={() => handleLogoMethodChange('url')} 
                  className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <label htmlFor="logoMethodUrl" className="ml-2 text-sm text-gray-700">URL</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="logoMethodUpload" 
                  name="logoMethod" 
                  value="upload" 
                  checked={logoMethod === 'upload'} 
                  onChange={() => handleLogoMethodChange('upload')} 
                  className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <label htmlFor="logoMethodUpload" className="ml-2 text-sm text-gray-700">Upload</label>
              </div>
            </div>

            {logoMethod === 'url' && (
              <input
                type="url"
                id="logoUrlInput"
                name="logoUrl" // formData.logoUrl will be used for this input
                value={formData.logoUrl} // When method is URL, this field holds the typed URL
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${logoUrlError ? 'border-red-500' : ''}`}
                placeholder="https://example.com/logo.png"
              />
            )}

            {logoMethod === 'upload' && (
              <input
                type="file"
                id="logoFileInput"
                name="logoFile"
                accept="image/*"
                onChange={handleLogoFileChange}
                className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 ${logoUrlError ? 'border border-red-500 rounded-md p-1' : ''}`}
              />
            )}
            {logoUrlError && <p className="mt-1 text-xs text-red-600">{logoUrlError}</p>}

            {/* Image Preview for Logo */}
            {formData.logoUrl && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-600 mb-1">Preview:</p>
                <img 
                  src={getFullImageUrl(formData.logoUrl)} 
                  alt="Logo Preview" 
                  className="max-h-20 max-w-full rounded border border-gray-200 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="logoDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date (Optional)
            </label>
            <input
              type="date"
              id="logoDate"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 mt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
            >
              {isSubmitting ? 'Creating...' : 'Create Logo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogoModal; 