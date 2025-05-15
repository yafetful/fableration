// 数据库初始化脚本
import db from './db.js';
import bcrypt from 'bcrypt';

console.log('正在初始化数据库...');

// 清空现有表数据
const clearTables = async () => {
  console.log('清空现有表数据...');
  
  try {
    // 需要先清空有外键约束的表
    await db.run('DELETE FROM event_items');
    await db.run('DELETE FROM events');
    await db.run('DELETE FROM blogs');
    await db.run('DELETE FROM announcements');
    
    console.log('表数据已清空');
  } catch (error) {
    console.error('清空表数据失败:', error.message);
  }
};

// 创建测试用户
const createUsers = async () => {
  console.log('创建测试用户...');
  
  try {
    // 检查是否已有admin用户
    const adminExists = await db.get("SELECT * FROM users WHERE email = ?", ['admin@fableration.com']);
    
    if (!adminExists) {
      const hashedPassword = bcrypt.hashSync('123', 10); // 默认密码 '123'
      
      await db.run(
        'INSERT INTO users (email, password, role, createdAt) VALUES (?, ?, ?, ?)',
        ['admin@fableration.com', hashedPassword, 'admin', new Date().toISOString()]
      );
      
      console.log('已创建管理员用户: admin@fableration.com (密码: 123)');
    } else {
      console.log('管理员用户已存在，跳过创建');
    }
  } catch (error) {
    console.error('创建用户失败:', error.message);
  }
};

// 创建示例博客
const createBlogs = async () => {
  console.log('创建示例博客...');
  
  try {
    const now = new Date().toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    
    // 博客1
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
    
    // 博客2
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
    
    // 博客3
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
    
    console.log('已创建3篇示例博客');
  } catch (error) {
    console.error('创建博客失败:', error.message);
  }
};

// 创建示例公告
const createAnnouncements = async () => {
  console.log('创建示例公告...');
  
  try {
    const now = new Date().toISOString();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // 公告1
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
    
    // 公告2
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
    
    console.log('已创建2条示例公告');
  } catch (error) {
    console.error('创建公告失败:', error.message);
  }
};

// 创建示例事件
const createEvents = async () => {
  console.log('创建示例事件...');
  
  try {
    const now = new Date().toISOString();
    
    // 事件1
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
    
    // 事件1的项目
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
    
    // 事件2
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
    
    // 事件2的项目
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
    
    console.log('已创建2个示例事件');
  } catch (error) {
    console.error('创建事件失败:', error.message);
  }
};

// 运行初始化
const initializeData = async () => {
  try {
    await clearTables();
    await createUsers();
    await createBlogs();
    await createAnnouncements();
    await createEvents();
    
    console.log('数据库初始化完成!');
    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

// 执行初始化
initializeData(); 