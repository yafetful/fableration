import express from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await db.all(`
      SELECT e.*, COUNT(ei.id) as itemCount 
      FROM events e
      LEFT JOIN event_items ei ON e.id = ei.eventId
      GROUP BY e.id
      ORDER BY e.createdAt DESC
    `);
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single event and its items
router.get('/:id', async (req, res) => {
  try {
    const event = await db.get('SELECT * FROM events WHERE id = ?', [req.params.id]);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Get event items
    const eventItems = await db.all(
      'SELECT * FROM event_items WHERE eventId = ? ORDER BY position ASC',
      [event.id]
    );
    
    // Merge event and items
    const result = {
      ...event,
      items: eventItems
    };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new event (requires authentication)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, imageUrl, summary, content, externalLink, published, items = [] } = req.body;
    
    if (!title || !summary) {
      return res.status(400).json({ message: 'Title and summary are required' });
    }
    
    // Transaction operation
    try {
      const now = new Date().toISOString();
      
      // Create event
      const eventResult = await db.run(
        `INSERT INTO events (title, imageUrl, summary, content, externalLink, published, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title, 
          imageUrl || null, 
          summary, 
          content || null, 
          externalLink || null, 
          published ? 1 : 0, 
          now, 
          now
        ]
      );
      
      const eventId = eventResult.lastID;
      
      // Add event items
      if (items && items.length > 0) {
        for (let index = 0; index < items.length; index++) {
          const item = items[index];
          await db.run(
            `INSERT INTO event_items (eventId, name, content, iconUrl, position)
            VALUES (?, ?, ?, ?, ?)`,
            [
              eventId,
              item.name,
              item.content || null,
              item.iconUrl || null,
              index
            ]
          );
        }
      }
      
      // Get full event data
      const newEvent = await db.get('SELECT * FROM events WHERE id = ?', [eventId]);
      const eventItems = await db.all(
        'SELECT * FROM event_items WHERE eventId = ? ORDER BY position ASC',
        [eventId]
      );
      
      const result = {
        ...newEvent,
        items: eventItems
      };
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event (requires authentication)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, imageUrl, summary, content, externalLink, published, items = [] } = req.body;
    const { id } = req.params;
    
    // Check if event exists
    const event = await db.get('SELECT * FROM events WHERE id = ?', [id]);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (!title || !summary) {
      return res.status(400).json({ message: 'Title and summary are required' });
    }
    
    // Transaction operation
    try {
      const now = new Date().toISOString();
      
      // Update event
      await db.run(
        `UPDATE events 
        SET title = ?, imageUrl = ?, summary = ?, content = ?, externalLink = ?, published = ?, updatedAt = ?
        WHERE id = ?`,
        [
          title, 
          imageUrl || null, 
          summary, 
          content || null, 
          externalLink || null, 
          published ? 1 : 0, 
          now, 
          id
        ]
      );
      
      // Delete all existing event items
      await db.run('DELETE FROM event_items WHERE eventId = ?', [id]);
      
      // Add new event items
      if (items && items.length > 0) {
        for (let index = 0; index < items.length; index++) {
          const item = items[index];
          await db.run(
            `INSERT INTO event_items (eventId, name, content, iconUrl, position)
            VALUES (?, ?, ?, ?, ?)`,
            [
              id,
              item.name,
              item.content || null,
              item.iconUrl || null,
              index
            ]
          );
        }
      }
      
      // Get updated event data
      const updatedEvent = await db.get('SELECT * FROM events WHERE id = ?', [id]);
      const eventItems = await db.all(
        'SELECT * FROM event_items WHERE eventId = ? ORDER BY position ASC',
        [id]
      );
      
      const result = {
        ...updatedEvent,
        items: eventItems
      };
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete event (requires authentication)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if event exists
    const event = await db.get('SELECT * FROM events WHERE id = ?', [id]);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Since foreign key constraints are set, deleting an event will automatically delete related event items
    await db.run('DELETE FROM events WHERE id = ?', [id]);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 