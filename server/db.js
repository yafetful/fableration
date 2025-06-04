// Database setup using sqlite3
import sqlite3 from 'sqlite3';
import fs from 'fs';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'database.sqlite');

// 打开数据库连接
const sqliteDb = new sqlite3.Database(dbPath);

// 封装Promise方法
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

const exec = (sql) => {
  return new Promise((resolve, reject) => {
    sqliteDb.exec(sql, function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

// 数据库接口
const db = {
  run,
  get,
  all,
  exec,
  prepare: (sql) => ({
    run: (params) => run(sql, Array.isArray(params) ? params : Object.values(params)),
    get: (params) => get(sql, Array.isArray(params) ? params : [params]),
    all: (params) => all(sql, Array.isArray(params) ? params : [params])
  }),
  close: () => {
    return new Promise((resolve, reject) => {
      sqliteDb.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
};

// 创建表和初始用户
const initializeDb = async () => {
  try {
    // Users table
    await exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        createdAt TEXT NOT NULL
      )
    `);

    // Logos table
    await exec(`
      CREATE TABLE IF NOT EXISTS logos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        logoUrl TEXT,
        date TEXT,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Authors table
    await exec(`
      CREATE TABLE IF NOT EXISTS authors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        avatarUrl TEXT,
        bio TEXT,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tags table
    await exec(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        color TEXT DEFAULT '#3B82F6',
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Blogs table
    await exec(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        slug TEXT,
        content TEXT,
        summary TEXT,
        category TEXT DEFAULT 'Blogs',
        imageUrl TEXT,
        coverImage TEXT,
        externalLink TEXT,
        logoId INTEGER,
        authorId INTEGER,
        referenceArticles TEXT,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        published INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (logoId) REFERENCES logos (id) ON DELETE SET NULL,
        FOREIGN KEY (authorId) REFERENCES authors (id) ON DELETE SET NULL
      )
    `);
    // Attempt to create unique index on slug immediately after table creation if blogs table is new
    // This might fail if blogs table existed and then was altered (slugs might not be unique yet)
    // The migration script will handle robust slug unique index creation.
    try {
      await exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug)');
    } catch (error) {
        console.log('Note: Could not create unique index on slug during initial table setup. Migration script will handle this.');
    }

    // Blog tags junction table
    await exec(`
      CREATE TABLE IF NOT EXISTS blog_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        blogId INTEGER NOT NULL,
        tagId INTEGER NOT NULL,
        FOREIGN KEY (blogId) REFERENCES blogs (id) ON DELETE CASCADE,
        FOREIGN KEY (tagId) REFERENCES tags (id) ON DELETE CASCADE,
        UNIQUE(blogId, tagId)
      )
    `);

    // Announcements table
    await exec(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        url TEXT,
        active INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expiresAt TEXT
      )
    `);

    // Events table
    await exec(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        imageUrl TEXT,
        summary TEXT NOT NULL,
        content TEXT,
        externalLink TEXT,
        published INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Highlights table
    await exec(`
      CREATE TABLE IF NOT EXISTS highlights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        imageUrl TEXT,
        url TEXT,
        type TEXT NOT NULL DEFAULT 'image',
        active INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Event items table
    await exec(`
      CREATE TABLE IF NOT EXISTS event_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        eventId INTEGER NOT NULL,
        name TEXT NOT NULL,
        content TEXT,
        iconUrl TEXT,
        position INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (eventId) REFERENCES events (id) ON DELETE CASCADE
      )
    `);

    // Ensure admin user exists
    const adminUser = await get('SELECT * FROM users WHERE email = ?', ['admin@fableration.com']);
    if (!adminUser) {
      const hashedPassword = bcrypt.hashSync('123', 10); 
      await run(
        'INSERT INTO users (email, password, role, createdAt) VALUES (?, ?, ?, ?)',
        ['admin@fableration.com', hashedPassword, 'admin', new Date().toISOString()]
      );
      console.log('Admin user created with email: admin@fableration.com and password: 123');
    }

    console.log('Database initial schema (CREATE TABLE IF NOT EXISTS) checked/applied successfully.');
  } catch (error) {
    console.error('Database initial schema (CREATE TABLE IF NOT EXISTS) check/apply error:', error);
    // Critical error during initial schema setup, might be best to exit
    // process.exit(1);
  }
};

// Call initializeDb when the module is loaded.
// The main application should ideally wait for this to complete if it depends on the db being ready.
initializeDb();

export default db; 

