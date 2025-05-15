import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth.js';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get __dirname (ES module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const createUploadDirs = () => {
  const uploadDir = path.join(__dirname, '../uploads');
  const eventImagesDir = path.join(uploadDir, 'events');
  const eventIconsDir = path.join(uploadDir, 'icons');
  const blogImagesDir = path.join(uploadDir, 'blogs');
  const highlightImagesDir = path.join(uploadDir, 'highlights');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  
  if (!fs.existsSync(eventImagesDir)) {
    fs.mkdirSync(eventImagesDir);
  }
  
  if (!fs.existsSync(eventIconsDir)) {
    fs.mkdirSync(eventIconsDir);
  }
  
  if (!fs.existsSync(blogImagesDir)) {
    fs.mkdirSync(blogImagesDir);
  }
  
  if (!fs.existsSync(highlightImagesDir)) {
    fs.mkdirSync(highlightImagesDir);
  }
};

// Create upload directories
createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Determine file save directory based on field name
    const uploadDir = path.join(__dirname, '../uploads');
    
    if (file.fieldname === 'eventImage') {
      cb(null, path.join(uploadDir, 'events'));
    } else if (file.fieldname === 'iconImage') {
      cb(null, path.join(uploadDir, 'icons'));
    } else if (file.fieldname === 'blogImage') {
      cb(null, path.join(uploadDir, 'blogs'));
    } else if (file.fieldname === 'highlightImage') {
      cb(null, path.join(uploadDir, 'highlights'));
    } else {
      cb(null, uploadDir);
    }
  },
  filename: function(req, file, cb) {
    // Generate unique filename to prevent file overwrite
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter, only allow image uploads
const fileFilter = (req, file, cb) => {
  // Acceptable image types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // Limit 20MB
  },
  fileFilter: fileFilter
});

// Event image upload interface
router.post('/event-image', authenticate, upload.single('eventImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Build accessible URL
    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/events/${req.file.filename}`;
    
    res.json({
      success: true,
      fileUrl: fileUrl,
      fileName: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Icon upload interface
router.post('/icon-image', authenticate, upload.single('iconImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Build accessible URL
    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/icons/${req.file.filename}`;
    
    res.json({
      success: true,
      fileUrl: fileUrl,
      fileName: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Blog image upload interface
router.post('/blog-image', authenticate, upload.single('blogImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Build accessible URL
    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/blogs/${req.file.filename}`;
    
    res.json({
      success: true,
      fileUrl: fileUrl,
      fileName: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Highlight image upload interface
router.post('/highlight-image', authenticate, upload.single('highlightImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Build accessible URL
    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/highlights/${req.file.filename}`;
    
    res.json({
      success: true,
      fileUrl: fileUrl,
      fileName: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Error handling middleware
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer error handling
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum size is 20MB.' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    // Other errors
    return res.status(500).json({ message: err.message });
  }
  next();
});

export default router; 