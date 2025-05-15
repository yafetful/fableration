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

    // Blogs table
    await exec(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        summary TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'Blogs',
        imageUrl TEXT,
        externalLink TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        published INTEGER NOT NULL DEFAULT 0
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
        createdAt TEXT NOT NULL,
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
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
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
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
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

    // 检查管理员用户是否存在
    const adminUser = await get('SELECT * FROM users WHERE email = ?', ['admin@fableration.com']);
    
    if (!adminUser) {
      const hashedPassword = bcrypt.hashSync('123', 10); // 默认密码是 '123'
      await run(
        'INSERT INTO users (email, password, role, createdAt) VALUES (?, ?, ?, ?)',
        ['admin@fableration.com', hashedPassword, 'admin', new Date().toISOString()]
      );
      console.log('Admin user created with email: admin@fableration.com and password: 123');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// 初始化数据库
initializeDb();

export default db; 