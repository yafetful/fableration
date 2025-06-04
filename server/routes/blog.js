import express from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Helper function to ensure unique slug
const ensureUniqueSlug = async (slug, excludeId = null) => {
  let uniqueSlug = slug;
  let counter = 1;
  
  while (true) {
    const existing = await db.get(
      'SELECT id FROM blogs WHERE slug = ? AND id != ?', 
      [uniqueSlug, excludeId || 0]
    );
    if (!existing) break;
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
};

// Get all blogs with related data
router.get('/', async (req, res) => {
  try {
    // First get basic blog data
    const blogs = await db.all(`
      SELECT * FROM blogs ORDER BY createdAt DESC
    `);
    
    // For each blog, get related data if it exists
    const blogsWithExtendedData = await Promise.all(blogs.map(async (blog) => {
      // Get logo data if logoId exists
      let logoData = null;
      if (blog.logoId) {
        logoData = await db.get('SELECT name as logoName, logoUrl FROM logos WHERE id = ?', [blog.logoId]);
      }
      
      // Get author data if authorId exists
      let authorData = null;
      if (blog.authorId) {
        authorData = await db.get('SELECT name as authorName, avatarUrl FROM authors WHERE id = ?', [blog.authorId]);
      }
      
      // Get tags
      const tags = await db.all(`
        SELECT t.id, t.name, t.color
        FROM tags t
        JOIN blog_tags bt ON t.id = bt.tagId
        WHERE bt.blogId = ?
      `, [blog.id]);
      
      return {
        ...blog,
        ...logoData,
        ...authorData,
        tags: tags || []
      };
    }));
    
    res.json(blogsWithExtendedData);
  } catch (error) {
    // Add detailed server-side logging of the error
    console.error("ERROR in GET /fab-api/blogs:", error); 
    // Optionally, send a more specific error message to the client, but be cautious with exposing internal details.
    res.status(500).json({ 
      message: "Internal server error. Please check server logs.", 
      // Exposing error.message to client for debugging, might want to remove in production
      internalDetails: error.message 
    });
  }
});

// Get single blog by id or slug
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);
    
    // First get basic blog data
    const blog = await db.get(`
      SELECT * FROM blogs 
      WHERE ${isNumeric ? 'id = ?' : 'slug = ?'}
    `, [identifier]);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Get logo data if logoId exists
    let logoData = null;
    if (blog.logoId) {
      logoData = await db.get('SELECT name as logoName, logoUrl FROM logos WHERE id = ?', [blog.logoId]);
    }
    
    // Get author data if authorId exists
    let authorData = null;
    if (blog.authorId) {
      authorData = await db.get('SELECT name as authorName, avatarUrl, bio as authorBio FROM authors WHERE id = ?', [blog.authorId]);
    }
    
    // Get tags for this blog
    const tags = await db.all(`
      SELECT t.id, t.name, t.color
      FROM tags t
      JOIN blog_tags bt ON t.id = bt.tagId
      WHERE bt.blogId = ?
    `, [blog.id]);
    
    // Get reference articles if any
    let referenceArticles = [];
    if (blog.referenceArticles) {
      const refIds = blog.referenceArticles.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (refIds.length > 0) {
        const placeholders = refIds.map(() => '?').join(',');
        const refBlogs = await db.all(`
          SELECT id, title, slug, summary, imageUrl, createdAt, externalLink
          FROM blogs 
          WHERE id IN (${placeholders}) AND published = 1
        `, refIds);
        
        // Get tags for each reference article
        for (const refBlog of refBlogs) {
          const refTags = await db.all(`
            SELECT t.id, t.name, t.color
            FROM tags t
            JOIN blog_tags bt ON t.id = bt.tagId
            WHERE bt.blogId = ?
          `, [refBlog.id]);
          
          referenceArticles.push({
            ...refBlog,
            tags: refTags
          });
        }
      }
    }
    
    res.json({
      ...blog,
      ...logoData,
      ...authorData,
      tags,
      referenceArticles
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new blog (protected)
router.post('/', authenticate, async (req, res) => {
  try {
    const { 
      title, content, summary, category, imageUrl, coverImage, externalLink, 
      logoId, authorId, referenceArticles, published, tags 
    } = req.body;
    
    const now = new Date().toISOString();
    let slug = null;
    
    if (title) {
      const baseSlug = generateSlug(title);
      slug = await ensureUniqueSlug(baseSlug);
    }
    
    const result = await db.run(
      `INSERT INTO blogs (title, slug, content, summary, category, imageUrl, coverImage, externalLink, logoId, authorId, referenceArticles, createdAt, updatedAt, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title || null,
        slug,
        content || null, 
        summary || null, 
        category || 'Blogs', 
        imageUrl || null,
        coverImage || null,
        externalLink || null,
        logoId || null,
        authorId || null,
        referenceArticles || null,
        now, 
        now, 
        published ? 1 : 0
      ]
    );
    
    // Handle tags
    if (tags && Array.isArray(tags)) {
      for (const tagId of tags) {
        await db.run(
          'INSERT INTO blog_tags (blogId, tagId) VALUES (?, ?)',
          [result.lastID, tagId]
        );
      }
    }
    
    const newBlog = await db.get('SELECT * FROM blogs WHERE id = ?', [result.lastID]);
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update blog (protected)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { 
      title, content, summary, category, imageUrl, coverImage, externalLink, 
      logoId, authorId, referenceArticles, published, tags 
    } = req.body;
    const { id } = req.params;
    
    // Check if blog exists
    const blog = await db.get('SELECT * FROM blogs WHERE id = ?', [id]);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    const now = new Date().toISOString();
    let slug = blog.slug;
    
    // Update slug if title changed
    if (title && title !== blog.title) {
      const baseSlug = generateSlug(title);
      slug = await ensureUniqueSlug(baseSlug, id);
    }
    
    await db.run(
      `UPDATE blogs 
      SET title = ?, slug = ?, content = ?, summary = ?, category = ?, imageUrl = ?, coverImage = ?, externalLink = ?, logoId = ?, authorId = ?, referenceArticles = ?, updatedAt = ?, published = ?
      WHERE id = ?`,
      [
        title || null,
        slug,
        content || null, 
        summary || null, 
        category || 'Blogs', 
        imageUrl || null,
        coverImage || null,
        externalLink || null,
        logoId || null,
        authorId || null,
        referenceArticles || null,
        now, 
        published ? 1 : 0, 
        id
      ]
    );
    
    // Update tags
    await db.run('DELETE FROM blog_tags WHERE blogId = ?', [id]);
    if (tags && Array.isArray(tags)) {
      // Ensure tags are unique before inserting
      const uniqueTagIds = [...new Set(tags.map(tag => Number(tag)))].filter(tagId => !isNaN(tagId) && tagId > 0);
      
      for (const tagId of uniqueTagIds) {
        await db.run(
          'INSERT INTO blog_tags (blogId, tagId) VALUES (?, ?)',
          [id, tagId]
        );
      }
    }
    
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

// === LOGOS MANAGEMENT ===

// Get all logos
router.get('/logos/all', async (req, res) => {
  try {
    const logos = await db.all('SELECT * FROM logos ORDER BY createdAt DESC');
    res.json(logos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new logo (protected)
router.post('/logos', authenticate, async (req, res) => {
  try {
    const { name, logoUrl, date } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const now = new Date().toISOString();
    
    const result = await db.run(
      'INSERT INTO logos (name, logoUrl, date, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
      [name, logoUrl || null, date || null, now, now]
    );
    
    const newLogo = await db.get('SELECT * FROM logos WHERE id = ?', [result.lastID]);
    res.status(201).json(newLogo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update logo (protected)
router.put('/logos/:id', authenticate, async (req, res) => {
  try {
    const { name, logoUrl, date } = req.body;
    const { id } = req.params;
    
    const logo = await db.get('SELECT * FROM logos WHERE id = ?', [id]);
    if (!logo) {
      return res.status(404).json({ message: 'Logo not found' });
    }
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const now = new Date().toISOString();
    
    await db.run(
      'UPDATE logos SET name = ?, logoUrl = ?, date = ?, updatedAt = ? WHERE id = ?',
      [name, logoUrl || null, date || null, now, id]
    );
    
    const updatedLogo = await db.get('SELECT * FROM logos WHERE id = ?', [id]);
    res.json(updatedLogo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete logo (protected)
router.delete('/logos/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const logo = await db.get('SELECT * FROM logos WHERE id = ?', [id]);
    if (!logo) {
      return res.status(404).json({ message: 'Logo not found' });
    }
    
    await db.run('DELETE FROM logos WHERE id = ?', [id]);
    res.json({ message: 'Logo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// === AUTHORS MANAGEMENT ===

// Get all authors
router.get('/authors/all', async (req, res) => {
  try {
    const authors = await db.all('SELECT * FROM authors ORDER BY createdAt DESC');
    res.json(authors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new author (protected)
router.post('/authors', authenticate, async (req, res) => {
  try {
    const { name, avatarUrl, bio } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const now = new Date().toISOString();
    
    const result = await db.run(
      'INSERT INTO authors (name, avatarUrl, bio, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
      [name, avatarUrl || null, bio || null, now, now]
    );
    
    const newAuthor = await db.get('SELECT * FROM authors WHERE id = ?', [result.lastID]);
    res.status(201).json(newAuthor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update author (protected)
router.put('/authors/:id', authenticate, async (req, res) => {
  try {
    const { name, avatarUrl, bio } = req.body;
    const { id } = req.params;
    
    const author = await db.get('SELECT * FROM authors WHERE id = ?', [id]);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const now = new Date().toISOString();
    
    await db.run(
      'UPDATE authors SET name = ?, avatarUrl = ?, bio = ?, updatedAt = ? WHERE id = ?',
      [name, avatarUrl || null, bio || null, now, id]
    );
    
    const updatedAuthor = await db.get('SELECT * FROM authors WHERE id = ?', [id]);
    res.json(updatedAuthor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete author (protected)
router.delete('/authors/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const author = await db.get('SELECT * FROM authors WHERE id = ?', [id]);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    
    await db.run('DELETE FROM authors WHERE id = ?', [id]);
    res.json({ message: 'Author deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// === TAGS MANAGEMENT ===

// Get all tags
router.get('/tags/all', async (req, res) => {
  try {
    const tags = await db.all('SELECT * FROM tags ORDER BY name ASC');
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new tag (protected)
router.post('/tags', authenticate, async (req, res) => {
  try {
    const { name, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const now = new Date().toISOString();
    
    const result = await db.run(
      'INSERT INTO tags (name, color, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
      [name, color || '#3B82F6', now, now]
    );
    
    const newTag = await db.get('SELECT * FROM tags WHERE id = ?', [result.lastID]);
    res.status(201).json(newTag);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ message: 'Tag name already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Update tag (protected)
router.put('/tags/:id', authenticate, async (req, res) => {
  try {
    const { name, color } = req.body;
    const { id } = req.params;
    
    const tag = await db.get('SELECT * FROM tags WHERE id = ?', [id]);
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const now = new Date().toISOString();
    
    await db.run(
      'UPDATE tags SET name = ?, color = ?, updatedAt = ? WHERE id = ?',
      [name, color || '#3B82F6', now, id]
    );
    
    const updatedTag = await db.get('SELECT * FROM tags WHERE id = ?', [id]);
    res.json(updatedTag);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ message: 'Tag name already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Delete tag (protected)
router.delete('/tags/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const tag = await db.get('SELECT * FROM tags WHERE id = ?', [id]);
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    await db.run('DELETE FROM tags WHERE id = ?', [id]);
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 