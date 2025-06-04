import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import LogoModal from '../../components/modals/LogoModal';
import AuthorModal from '../../components/modals/AuthorModal';
import TagModal from '../../components/modals/TagModal';
import api from '../../api';
import type { Blog, Logo, Author, Tag } from '../../api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Add API base URL constant
const API_BASE_URL = '';

const categories = ['Blogs', 'News', 'Events'];

// Process image URL, add API base URL if it's a relative path
const getFullImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
};

// 富文本编辑器的工具栏配置
const quillModules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
    handlers: {
      image: async function (this: any) {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
        input.onchange = async () => {
          const file = input.files && input.files[0];
          if (!file) return;
          // 上传图片
          try {
            const uploadResult = await api.upload.blogImage(file);
            const quill = this.quill;
            const range = quill.getSelection();
            quill.insertEmbed(range ? range.index : 0, 'image', uploadResult.fileUrl);
          } catch (err) {
            alert('Image upload failed');
          }
        };
      }
    }
  }
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
  'list', 'bullet', 'link', 'image'
];

// Define a more specific type for the form's state
interface BlogFormState extends Omit<Blog, 'tags' | 'referenceArticles'> {
  tags: number[]; // Ensures tags are always an array of numbers (IDs)
  // referenceArticles will be handled by a separate state: selectedReferenceArticleIds
}

const BlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal states
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [authorModalOpen, setAuthorModalOpen] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  
  // Data states
  const [logos, setLogos] = useState<Logo[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<BlogFormState>({
    title: '',
    slug: '',
    content: '',
    summary: '',
    category: 'Blogs',
    imageUrl: '',
    coverImage: '',
    externalLink: '',
    logoId: undefined,
    authorId: undefined,
    published: false,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  const [selectedReferenceArticleIds, setSelectedReferenceArticleIds] = useState<number[]>([]);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageMethod, setImageMethod] = useState<'url' | 'upload'>('url');
  const [imageError, setImageError] = useState('');

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImageMethod, setCoverImageMethod] = useState<'url' | 'upload'>('url');
  const [coverImageError, setCoverImageError] = useState('');
  
  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [logosData, authorsData, tagsData, blogsData] = await Promise.all([
          api.logos.getAll(),
          api.authors.getAll(),
          api.tags.getAll(),
          api.blogs.getAll()
        ]);
        
        setLogos(logosData);
        setAuthors(authorsData);
        setTags(tagsData);
        setAllBlogs(blogsData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };
    
    loadInitialData();
  }, []);
  
  // Load blog data for editing
  useEffect(() => {
    if (isEditing) {
      const fetchBlog = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const blogFromApi = await api.blogs.getById(id!);
          
          // Process tags: API might return Tag[] or number[]. Ensure it's number[] for form state.
          const initialSelectedTagIds = blogFromApi.tags && Array.isArray(blogFromApi.tags)
            ? blogFromApi.tags.map((tag: any) => typeof tag === 'object' ? tag.id : tag).filter(tagId => tagId != null) as number[]
            : [];

          // Process referenceArticles: API returns string, convert to number[] for multi-select state
          let initialSelectedRefArticleIds: number[] = [];
          if (blogFromApi.referenceArticles && typeof blogFromApi.referenceArticles === 'string') {
            initialSelectedRefArticleIds = blogFromApi.referenceArticles.split(',')
              .map(idStr => parseInt(idStr.trim()))
              .filter(idNum => !isNaN(idNum) && idNum > 0);
          }
          
          setFormData({
            ...(blogFromApi as Omit<Blog, 'tags' | 'referenceArticles'>), // Spread all other fields
            tags: initialSelectedTagIds, // Set processed tag IDs
          });
          setSelectedReferenceArticleIds(initialSelectedRefArticleIds);
          
          setImageMethod(blogFromApi.imageUrl ? 'url' : 'upload');
          setCoverImageMethod(blogFromApi.coverImage ? 'url' : 'upload'); // Initialize cover image method
        } catch (err) {
          console.error('Failed to fetch blog:', err);
          setError('Failed to load the blog post. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchBlog();
    } else {
      // For new blog, ensure tags and reference articles are initialized correctly
      setFormData(prev => ({
        ...prev,
        tags: [],
      }));
      setSelectedReferenceArticleIds([]);
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
  
  // Handle tag selection
  const handleTagToggle = (tagId: number) => {
    const currentTagIds = formData.tags || []; // formData.tags is now guaranteed to be number[]
    const newTagIds = currentTagIds.includes(tagId)
      ? currentTagIds.filter(id => id !== tagId)
      : [...currentTagIds, tagId];
    
    setFormData(prev => ({
      ...prev,
      tags: newTagIds
    }));
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
        imageUrl: '' // Clear URL when switching to upload for main image
      }));
    } else {
      setImageFile(null);
      if (fileInputRef.current) { // Assuming separate ref for main image upload
        fileInputRef.current.value = '';
      }
    }
    setImageError('');
  };

  const handleCoverImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        setCoverImageError('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setCoverImageError('Image size should not exceed 5MB');
        return;
      }
      setCoverImageFile(file);
      setCoverImageError('');
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, coverImage: url }));
    }
  };

  const handleCoverImageMethodChange = (method: 'url' | 'upload') => {
    setCoverImageMethod(method);
    if (method === 'upload') {
      setFormData(prev => ({ ...prev, coverImage: '' })); // Clear URL when switching to upload
    } else {
      setCoverImageFile(null);
      // Potentially add a separate ref for cover image file input if needed for reset
    }
    setCoverImageError('');
  };
  
  // Modal callbacks
  const handleLogoCreated = (newLogo: Logo) => {
    setLogos(prev => [...prev, newLogo]);
    setFormData(prev => ({ ...prev, logoId: newLogo.id }));
  };
  
  const handleAuthorCreated = (newAuthor: Author) => {
    setAuthors(prev => [...prev, newAuthor]);
    setFormData(prev => ({ ...prev, authorId: newAuthor.id }));
  };
  
  const handleTagCreated = (newTag: Tag) => {
    setTags(prev => [...prev, newTag]);
    if (newTag.id) {
      handleTagToggle(newTag.id);
    }
  };
  
  const handleReferenceArticlesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(e.target.selectedOptions)
      .map(option => parseInt(option.value, 10))
      .filter(id => !isNaN(id));
    setSelectedReferenceArticleIds(selectedIds);
  };
  
  const clearSelectedReferenceArticles = () => {
    setSelectedReferenceArticleIds([]);
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
      // If there are image files to upload, handle upload first
      let updatedImageUrl = formData.imageUrl;
      if (imageMethod === 'upload' && imageFile) {
        try {
          const uploadResult = await api.upload.blogImage(imageFile); // Main image upload
          updatedImageUrl = uploadResult.fileUrl;
        } catch (err) {
          console.error('Failed to upload blog image:', err);
          setError('Failed to upload main image. Please try again.');
          setIsSaving(false);
          return;
        }
      }

      let updatedCoverImageUrl = formData.coverImage;
      if (coverImageMethod === 'upload' && coverImageFile) {
        try {
          // Assuming api.upload.blogImage can be reused or you have a specific one for cover images
          const uploadResult = await api.upload.blogImage(coverImageFile); 
          updatedCoverImageUrl = uploadResult.fileUrl;
        } catch (err) {
          console.error('Failed to upload cover image:', err);
          setError('Failed to upload cover image. Please try again.');
          setIsSaving(false);
          return;
        }
      }
      
      // Prepare blog data
      const blogDataForApi: Partial<Blog> = {
        ...formData, 
        imageUrl: updatedImageUrl,
        coverImage: updatedCoverImageUrl, // Use the potentially uploaded cover image URL
        tags: formData.tags, 
        referenceArticles: selectedReferenceArticleIds.join(','), // Convert number[] to string for API
        updatedAt: new Date().toISOString(),
      };
      
      if (!isEditing && !blogDataForApi.createdAt) { // Ensure createdAt is set for new posts
        blogDataForApi.createdAt = new Date().toISOString();
      }
      
      // Save blog
      if (isEditing) {
        await api.blogs.update(id!, blogDataForApi as Blog);
      } else {
        await api.blogs.create(blogDataForApi as Blog);
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
                        <ReactQuill
                          theme="snow"
                          value={formData.content || ''}
                          onChange={value => setFormData(prev => ({ ...prev, content: value }))}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Full post content"
                          style={{ minHeight: 300, background: '#fff' }}
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
                    
                    {/* Cover Image input */}
                    <div className="form-group">
                      <label htmlFor="coverImage" className="form-label">
                        Cover Image URL (Optional)
                      </label>
                      
                      {/* Cover Image method selection */}
                      <div className="image-upload-options mt-1">
                        <div className="image-upload-option">
                          <input
                            type="radio"
                            id="coverImageMethodUrl"
                            name="coverImageMethod"
                            className="form-radio"
                            checked={coverImageMethod === 'url'}
                            onChange={() => handleCoverImageMethodChange('url')}
                          />
                          <label htmlFor="coverImageMethodUrl" className="form-check-label">
                            Image URL
                          </label>
                        </div>
                        <div className="image-upload-option">
                          <input
                            type="radio"
                            id="coverImageMethodUpload"
                            name="coverImageMethod"
                            className="form-radio"
                            checked={coverImageMethod === 'upload'}
                            onChange={() => handleCoverImageMethodChange('upload')}
                          />
                          <label htmlFor="coverImageMethodUpload" className="form-check-label">
                            Upload Image
                          </label>
                        </div>
                      </div>

                      {coverImageMethod === 'url' && (
                        <div className="mt-2">
                          <input
                            type="url"
                            name="coverImage"
                            id="coverImage"
                            value={formData.coverImage || ''} // Ensure this updates when method changes
                            onChange={handleChange}      // Existing handleChange for text inputs
                            className={`form-input ${coverImageError ? 'error' : ''}`}
                            placeholder="https://example.com/cover.jpg"
                          />
                        </div>
                      )}

                      {coverImageMethod === 'upload' && (
                        <div className="mt-2">
                          <input
                            type="file"
                            name="coverImageFile" // Distinct name for file input state
                            id="coverImageFile"
                            accept="image/*"
                            // Add a ref: const coverFileInputRef = useRef<HTMLInputElement>(null);
                            onChange={handleCoverImageFileChange}
                            className={`form-file-input ${coverImageError ? 'error' : ''}`}
                          />
                        </div>
                      )}

                      {/* Cover Image preview */}
                      {formData.coverImage && (
                        <div className="mt-4">
                          <p className="mb-2 text-sm font-medium text-gray-700">Cover Image Preview:</p>
                          <img 
                            src={getFullImageUrl(formData.coverImage)} 
                            alt="Cover Preview" 
                            className="object-cover w-full h-40 rounded-md"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = 'https://via.placeholder.com/800x400?text=Error+Loading+Image';
                            }}
                          />
                        </div>
                      )}
                      {coverImageError && <p className="mt-2 text-sm text-red-600">{coverImageError}</p>}
                      <p className="form-help-text mt-2">
                        Cover image will be displayed instead of main image if provided. Max 5MB.
                      </p>
                    </div>
                    
                    {/* Logo selection */}
                    <div className="form-group">
                      <label htmlFor="logoId" className="form-label">
                        Logo (Optional)
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        <select
                          name="logoId"
                          id="logoId"
                          value={formData.logoId || ''}
                          onChange={handleChange}
                          className="form-select flex-1"
                        >
                          <option value="">Select a logo</option>
                          {logos.map(logo => (
                            <option key={logo.id} value={logo.id}>
                              {logo.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setLogoModalOpen(true)}
                          className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          + New
                        </button>
                      </div>
                    </div>
                    
                    {/* Author selection */}
                    <div className="form-group">
                      <label htmlFor="authorId" className="form-label">
                        Author (Optional)
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        <select
                          name="authorId"
                          id="authorId"
                          value={formData.authorId || ''}
                          onChange={handleChange}
                          className="form-select flex-1"
                        >
                          <option value="">Select an author</option>
                          {authors.map(author => (
                            <option key={author.id} value={author.id}>
                              {author.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setAuthorModalOpen(true)}
                          className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          + New
                        </button>
                      </div>
                    </div>
                    
                    {/* Tags selection */}
                    <div className="form-group">
                      <div className="flex justify-between items-center">
                        <label className="form-label">Tags (Optional)</label>
                        <button
                          type="button"
                          onClick={() => setTagModalOpen(true)}
                          className="px-2 py-1 text-xs font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          + New Tag
                        </button>
                      </div>
                      <div className="mt-2">
                        {tags.length === 0 ? (
                          <p className="text-sm text-gray-500">No tags available. Create one first.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {tags.map(tag => {
                              const isSelected = formData.tags.includes(tag.id!);
                              return (
                                <button
                                  key={tag.id}
                                  type="button"
                                  onClick={() => handleTagToggle(tag.id!)}
                                  className={`px-3 py-1 text-sm font-medium rounded-full border-2 ${
                                    isSelected 
                                      ? 'text-white border-transparent' 
                                      : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50'
                                  }`}
                                  style={isSelected ? { backgroundColor: tag.color } : {}}
                                >
                                  {tag.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Reference Articles */}
                    <div className="form-group">
                      <label htmlFor="referenceArticlesSelect" className="form-label">
                        Reference Articles (Optional)
                      </label>
                      <div className="mt-1">
                        <select
                          multiple
                          name="referenceArticlesSelect"
                          id="referenceArticlesSelect"
                          value={selectedReferenceArticleIds.map(String)}
                          onChange={handleReferenceArticlesChange}
                          className="form-input form-multiselect w-full"
                          size={5}
                        >
                          {allBlogs
                            .filter(blog => blog.published && !(isEditing && blog.id === parseInt(id!)))
                            .map(blog => (
                              <option key={blog.id} value={blog.id!}>
                                {blog.title} (ID: {blog.id})
                              </option>
                            ))}
                        </select>
                        <button 
                          type="button"
                          onClick={clearSelectedReferenceArticles}
                          className="mt-2 px-3 py-1 text-xs font-medium text-white bg-red-600 border border-transparent rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          Clear Selections
                        </button>
                      </div>
                      <p className="form-help-text">
                        Select multiple articles. Hold Ctrl (or Cmd on Mac) and click to select/deselect multiple items.
                      </p>
                      {allBlogs.length > 0 && !allBlogs.filter(blog => blog.published && !(isEditing && blog.id === parseInt(id!))).length && (
                        <p className="text-xs text-gray-500 mt-1">No other published articles available to reference.</p>
                      )}

                      {/* Display selected reference articles with view links */}
                      {selectedReferenceArticleIds.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Reference Articles:</h4>
                          <ul className="list-disc list-inside pl-2 space-y-1">
                            {selectedReferenceArticleIds.map(refId => {
                              const refBlog = allBlogs.find(b => b.id === refId);
                              if (refBlog) {
                                return (
                                  <li key={refId} className="text-sm text-gray-600 flex justify-between items-center">
                                    <span>{refBlog.title} (ID: {refBlog.id})</span>
                                    <a 
                                      href={`/blog/${refBlog.slug}`} // Assuming public blog view is /blog/:slug
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="ml-2 px-2 py-0.5 text-xs text-indigo-600 hover:text-indigo-900 border border-indigo-300 rounded hover:bg-indigo-50"
                                    >
                                      View
                                    </a>
                                  </li>
                                );
                              }
                              return null;
                            })}
                          </ul>
                        </div>
                      )}
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
      
      {/* Modals */}
      <LogoModal
        isOpen={logoModalOpen}
        onClose={() => setLogoModalOpen(false)}
        onLogoCreated={handleLogoCreated}
      />
      
      <AuthorModal
        isOpen={authorModalOpen}
        onClose={() => setAuthorModalOpen(false)}
        onAuthorCreated={handleAuthorCreated}
      />
      
      <TagModal
        isOpen={tagModalOpen}
        onClose={() => setTagModalOpen(false)}
        onTagCreated={handleTagCreated}
      />
    </div>
  );
};

export default BlogEditor; 