import express from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await db.all('SELECT * FROM blogs ORDER BY createdAt DESC');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single blog by id
router.get('/:id', async (req, res) => {
  try {
    const blog = await db.get('SELECT * FROM blogs WHERE id = ?', [req.params.id]);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new blog (protected)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, content, summary, category, imageUrl, externalLink, published } = req.body;
    
    if (!title || !summary) {
      return res.status(400).json({ message: 'Title and summary are required' });
    }
    
    const now = new Date().toISOString();
    
    const result = await db.run(
      `INSERT INTO blogs (title, content, summary, category, imageUrl, externalLink, createdAt, updatedAt, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, 
        content || null, 
        summary, 
        category || 'Blogs', 
        imageUrl || null, 
        externalLink || null, 
        now, 
        now, 
        published ? 1 : 0
      ]
    );
    
    const newBlog = await db.get('SELECT * FROM blogs WHERE id = ?', [result.lastID]);
    
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update blog (protected)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, content, summary, category, imageUrl, externalLink, published } = req.body;
    const { id } = req.params;
    
    // Check if blog exists
    const blog = await db.get('SELECT * FROM blogs WHERE id = ?', [id]);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    if (!title || !summary) {
      return res.status(400).json({ message: 'Title and summary are required' });
    }
    
    const now = new Date().toISOString();
    
    await db.run(
      `UPDATE blogs 
      SET title = ?, content = ?, summary = ?, category = ?, imageUrl = ?, externalLink = ?, updatedAt = ?, published = ?
      WHERE id = ?`,
      [
        title, 
        content || null, 
        summary, 
        category || 'Blogs', 
        imageUrl || null, 
        externalLink || null, 
        now, 
        published ? 1 : 0, 
        id
      ]
    );
    
    const updatedBlog = await db.get('SELECT * FROM blogs WHERE id = ?', [id]);
    
    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete blog (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if blog exists
    const blog = await db.get('SELECT * FROM blogs WHERE id = ?', [id]);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    await db.run('DELETE FROM blogs WHERE id = ?', [id]);
    
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 