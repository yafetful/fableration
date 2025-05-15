import express from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 获取所有事件
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

// 获取单个事件及其项目
router.get('/:id', async (req, res) => {
  try {
    const event = await db.get('SELECT * FROM events WHERE id = ?', [req.params.id]);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // 获取事件项目
    const eventItems = await db.all(
      'SELECT * FROM event_items WHERE eventId = ? ORDER BY position ASC',
      [event.id]
    );
    
    // 合并事件和项目
    const result = {
      ...event,
      items: eventItems
    };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 创建新事件 (需要认证)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, imageUrl, summary, content, externalLink, published, items = [] } = req.body;
    
    if (!title || !summary) {
      return res.status(400).json({ message: 'Title and summary are required' });
    }
    
    // 事务操作
    try {
      const now = new Date().toISOString();
      
      // 创建事件
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
      
      // 添加事件项目
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
      
      // 获取完整的事件数据
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

// 更新事件 (需要认证)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, imageUrl, summary, content, externalLink, published, items = [] } = req.body;
    const { id } = req.params;
    
    // 检查事件是否存在
    const event = await db.get('SELECT * FROM events WHERE id = ?', [id]);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (!title || !summary) {
      return res.status(400).json({ message: 'Title and summary are required' });
    }
    
    // 事务操作
    try {
      const now = new Date().toISOString();
      
      // 更新事件
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
      
      // 删除所有现有的事件项目
      await db.run('DELETE FROM event_items WHERE eventId = ?', [id]);
      
      // 添加新的事件项目
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
      
      // 获取更新后的事件数据
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

// 删除事件 (需要认证)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查事件是否存在
    const event = await db.get('SELECT * FROM events WHERE id = ?', [id]);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // 由于设置了外键约束，删除事件会自动删除相关的事件项目
    await db.run('DELETE FROM events WHERE id = ?', [id]);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 