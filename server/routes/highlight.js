import express from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all highlights
router.get('/', async (req, res) => {
  try {
    const highlights = await db.all('SELECT * FROM highlights ORDER BY createdAt DESC');
    res.json(highlights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active highlights
router.get('/active', async (req, res) => {
  try {
    const activeHighlights = await db.all(
      `SELECT * FROM highlights 
      WHERE active = 1 
      ORDER BY createdAt DESC`
    );
    
    res.json(activeHighlights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single highlight by id
router.get('/:id', async (req, res) => {
  try {
    const highlight = await db.get('SELECT * FROM highlights WHERE id = ?', [req.params.id]);
    
    if (!highlight) {
      return res.status(404).json({ message: 'Highlight not found' });
    }
    
    res.json(highlight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new highlight (protected)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, imageUrl, url, active, type } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Highlight title is required' });
    }
    
    const now = new Date().toISOString();
    
    const result = await db.run(
      `INSERT INTO highlights (title, imageUrl, url, active, type, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, imageUrl || null, url || null, active ? 1 : 0, type || 'image', now, now]
    );
    
    const newHighlight = await db.get('SELECT * FROM highlights WHERE id = ?', [result.lastID]);
    
    res.status(201).json(newHighlight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update highlight (protected)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, imageUrl, url, active, type } = req.body;
    const { id } = req.params;
    
    // Check if highlight exists
    const highlight = await db.get('SELECT * FROM highlights WHERE id = ?', [id]);
    
    if (!highlight) {
      return res.status(404).json({ message: 'Highlight not found' });
    }
    
    if (!title) {
      return res.status(400).json({ message: 'Highlight title is required' });
    }
    
    const now = new Date().toISOString();
    
    await db.run(
      `UPDATE highlights 
      SET title = ?, imageUrl = ?, url = ?, active = ?, type = ?, updatedAt = ?
      WHERE id = ?`,
      [title, imageUrl || null, url || null, active ? 1 : 0, type || 'image', now, id]
    );
    
    const updatedHighlight = await db.get('SELECT * FROM highlights WHERE id = ?', [id]);
    
    res.json(updatedHighlight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete highlight (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if highlight exists
    const highlight = await db.get('SELECT * FROM highlights WHERE id = ?', [id]);
    
    if (!highlight) {
      return res.status(404).json({ message: 'Highlight not found' });
    }
    
    await db.run('DELETE FROM highlights WHERE id = ?', [id]);
    
    res.json({ message: 'Highlight deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 