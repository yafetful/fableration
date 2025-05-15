import express from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await db.all('SELECT * FROM announcements ORDER BY createdAt DESC');
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active announcements
router.get('/active', async (req, res) => {
  try {
    const now = new Date().toISOString();
    
    const activeAnnouncements = await db.all(
      `SELECT * FROM announcements 
      WHERE active = 1 
      AND (expiresAt IS NULL OR expiresAt > ?)
      ORDER BY createdAt DESC`,
      [now]
    );
    
    res.json(activeAnnouncements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single announcement by id
router.get('/:id', async (req, res) => {
  try {
    const announcement = await db.get('SELECT * FROM announcements WHERE id = ?', [req.params.id]);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new announcement (protected)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, message, url, active, expiresAt } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Announcement title is required' });
    }
    
    const now = new Date().toISOString();
    
    const result = await db.run(
      `INSERT INTO announcements (title, message, url, active, createdAt, expiresAt)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [title, message || '', url || null, active ? 1 : 0, now, expiresAt || null]
    );
    
    const newAnnouncement = await db.get('SELECT * FROM announcements WHERE id = ?', [result.lastID]);
    
    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update announcement (protected)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, message, url, active, expiresAt } = req.body;
    const { id } = req.params;
    
    // Check if announcement exists
    const announcement = await db.get('SELECT * FROM announcements WHERE id = ?', [id]);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    if (!title) {
      return res.status(400).json({ message: 'Announcement title is required' });
    }
    
    await db.run(
      `UPDATE announcements 
      SET title = ?, message = ?, url = ?, active = ?, expiresAt = ?
      WHERE id = ?`,
      [title, message || '', url || null, active ? 1 : 0, expiresAt || null, id]
    );
    
    const updatedAnnouncement = await db.get('SELECT * FROM announcements WHERE id = ?', [id]);
    
    res.json(updatedAnnouncement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete announcement (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if announcement exists
    const announcement = await db.get('SELECT * FROM announcements WHERE id = ?', [id]);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    await db.run('DELETE FROM announcements WHERE id = ?', [id]);
    
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 