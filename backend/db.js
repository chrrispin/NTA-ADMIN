import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');
const DB_PATH = join(DATA_DIR, 'admin.db');

// Create data directory if it doesn't exist
try {
  mkdirSync(DATA_DIR, { recursive: true });
} catch (err) {
  console.error('Error creating data directory:', err);
}

let dbInstance = null;

// Initialize database
export const initDB = () => {
  return new Promise((resolve, reject) => {
    console.log('📂 Attempting to open database at:', DB_PATH);
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Database open error:', err);
        reject(err);
      }
      else {
        console.log('✓ Database opened successfully');
        db.serialize(() => {
          // Create users table if it doesn't exist
          db.run(
            `CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              email TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            (err) => {
              if (err) {
                console.error('❌ Users table creation error:', err);
                reject(err);
              }
              else {
                console.log('✓ Users table ready');
              }
            }
          );
          
          // Create articles table if it doesn't exist
          db.run(
            `CREATE TABLE IF NOT EXISTS articles (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT NOT NULL,
              slug TEXT UNIQUE,
              excerpt TEXT,
              content TEXT NOT NULL,
              featured_image TEXT,
              category TEXT,
              author TEXT,
              status TEXT DEFAULT 'draft',
              views INTEGER DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            (err) => {
              if (err) {
                console.error('❌ Articles table creation error:', err);
                reject(err);
              }
              else {
                console.log('✓ Articles table ready');
                dbInstance = db;
                resolve(db);
              }
            }
          );
        });
      }
    });
  });
};

// Get database connection
export const getDB = () => {
  if (dbInstance) {
    return dbInstance;
  }
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('Database error:', err);
  });
};

// Close database
export const closeDB = (db) => {
  if (db) {
    db.close((err) => {
      if (err) console.error('Error closing database:', err);
    });
  }
};

// Run query
export const runQuery = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Get single row
export const getQuery = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Get all rows
export const allQuery = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
