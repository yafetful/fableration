// Database initialization script
import db from './db.js';
import bcrypt from 'bcrypt';

console.log('Initializing database...');

// Clear existing table data
const clearTables = async () => {
  console.log('Clearing existing table data...');
  
  try {
    // First clear tables with foreign key constraints
    await db.run('DELETE FROM event_items');
    await db.run('DELETE FROM events');
    await db.run('DELETE FROM blogs');
    await db.run('DELETE FROM announcements');
    
    console.log('Table data cleared');
  } catch (error) {
    console.error('Failed to clear table data:', error.message);
  }
};

// Create test user
const createUsers = async () => {
  console.log('Creating test user...');
  
  try {
    // Check if admin user already exists
    const adminExists = await db.get("SELECT * FROM users WHERE email = ?", ['admin@fableration.com']);
    
    if (!adminExists) {
      const hashedPassword = bcrypt.hashSync('123', 10); // Default password '123'
      
      await db.run(
        'INSERT INTO users (email, password, role, createdAt) VALUES (?, ?, ?, ?)',
        ['admin@fableration.com', hashedPassword, 'admin', new Date().toISOString()]
      );
      
      console.log('Admin user created: admin@fableration.com (password: 123)');
    } else {
      console.log('Admin user already exists, skipping creation');
    }
  } catch (error) {
    console.error('Failed to create user:', error.message);
  }
};

// Create example blogs
const createBlogs = async () => {
  console.log('Creating example blogs...');
  
  try {
    const now = new Date().toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    
    // Blog 1
    await db.run(
      `INSERT INTO blogs (title, content, summary, category, imageUrl, externalLink, createdAt, updatedAt, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Sample Blog Title 1',
        'This is a sample blog post content. It can contain detailed information about your topic.',
        'A brief overview of this blog post',
        'Blogs',
        'https://via.placeholder.com/800x400',
        'https://example.com/blog1',
        yesterday,
        now,
        1
      ]
    );
    
    // Blog 2
    await db.run(
      `INSERT INTO blogs (title, content, summary, category, imageUrl, externalLink, createdAt, updatedAt, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Sample Blog Title 2',
        'Another sample blog post content. You can write detailed information here.',
        'A short summary of this blog post',
        'News',
        '',
        '',
        yesterday,
        yesterday,
        0
      ]
    );
    
    // Blog 3
    await db.run(
      `INSERT INTO blogs (title, content, summary, category, imageUrl, externalLink, createdAt, updatedAt, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Sample Event Post',
        '',
        'This is a sample event announcement',
        'Events',
        'https://via.placeholder.com/800x400',
        'https://example.com/event',
        now,
        now,
        1
      ]
    );
    
    console.log('3 example blogs created');
  } catch (error) {
    console.error('Failed to create blogs:', error.message);
  }
};

// Create example announcements
const createAnnouncements = async () => {
  console.log('Creating example announcements...');
  
  try {
    const now = new Date().toISOString();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // Announcement 1
    await db.run(
      `INSERT INTO announcements (title, message, url, active, createdAt, expiresAt)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'Website Launch',
        'Welcome to our website!',
        'https://example.com/welcome',
        1,
        now,
        nextMonth.toISOString()
      ]
    );
    
    // Announcement 2
    await db.run(
      `INSERT INTO announcements (title, message, url, active, createdAt, expiresAt)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'Maintenance Notice',
        'Website maintenance in progress, some features may be unavailable.',
        '',
        0,
        now,
        null
      ]
    );
    
    console.log('2 example announcements created');
  } catch (error) {
    console.error('Failed to create announcements:', error.message);
  }
};

// Create example events
const createEvents = async () => {
  console.log('Creating example events...');
  
  try {
    const now = new Date().toISOString();
    
    // Event 1
    const event1Result = await db.run(
      `INSERT INTO events (title, imageUrl, summary, content, externalLink, published, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Annual Conference 2023',
        'https://via.placeholder.com/800x400',
        'Join us for our annual conference with industry leaders',
        'Join us for our annual conference with industry leaders. The event will feature keynote speeches, workshops, and networking opportunities.',
        'https://example.com/conference',
        1,
        now,
        now
      ]
    );
    
    const event1Id = event1Result.lastID;
    
    // Event 1 items
    await db.run(
      `INSERT INTO event_items (eventId, name, content, iconUrl, position)
      VALUES (?, ?, ?, ?, ?)`,
      [
        event1Id,
        'Keynote Speech',
        'Industry leader keynote on emerging trends.',
        'https://via.placeholder.com/50',
        0
      ]
    );
    
    await db.run(
      `INSERT INTO event_items (eventId, name, content, iconUrl, position)
      VALUES (?, ?, ?, ?, ?)`,
      [
        event1Id,
        'Workshop Session',
        'Interactive workshop on new technologies.',
        'https://via.placeholder.com/50',
        1
      ]
    );
    
    // Event 2
    const event2Result = await db.run(
      `INSERT INTO events (title, imageUrl, summary, content, externalLink, published, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Tech Workshop Series',
        'https://via.placeholder.com/800x400',
        'A series of workshops covering the latest technologies',
        'A series of workshops covering the latest technologies...',
        '',
        0,
        now,
        now
      ]
    );
    
    const event2Id = event2Result.lastID;
    
    // Event 2 items
    await db.run(
      `INSERT INTO event_items (eventId, name, content, iconUrl, position)
      VALUES (?, ?, ?, ?, ?)`,
      [
        event2Id,
        'Web Development',
        'Learn the latest web development frameworks.',
        'https://via.placeholder.com/50',
        0
      ]
    );
    
    console.log('2 example events created');
  } catch (error) {
    console.error('Failed to create events:', error.message);
  }
};

// Run initialization
const initializeData = async () => {
  try {
    await clearTables();
    await createUsers();
    await createBlogs();
    await createAnnouncements();
    await createEvents();
    
    console.log('Database initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

// Execute initialization
initializeData(); 