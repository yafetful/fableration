import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth.js';
import { fileURLToPath } from 'url';

const router = express.Router();

// 获取__dirname (ES模块中)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保上传目录存在
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

// 创建上传目录
createUploadDirs();

// 配置存储
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // 根据字段名确定文件保存目录
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
    // 生成唯一文件名，防止文件覆盖
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 文件过滤器，只允许上传图片
const fileFilter = (req, file, cb) => {
  // 接受的图片类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// 创建上传中间件
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制5MB
  },
  fileFilter: fileFilter
});

// 事件图片上传接口
router.post('/event-image', authenticate, upload.single('eventImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // 构建可访问的URL
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

// 图标上传接口
router.post('/icon-image', authenticate, upload.single('iconImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // 构建可访问的URL
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

// 博客图片上传接口
router.post('/blog-image', authenticate, upload.single('blogImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // 构建可访问的URL
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

// Highlight图片上传接口
router.post('/highlight-image', authenticate, upload.single('highlightImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // 构建可访问的URL
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

// 错误处理中间件
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer错误处理
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    // 其他错误
    return res.status(500).json({ message: err.message });
  }
  next();
});

export default router; 