import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data.db');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export const query = (sql, params = []) => {
  try {
    if (sql.trim().toLowerCase().startsWith('select')) {
      return db.prepare(sql).all(params);
    } else {
      return db.prepare(sql).run(params);
    }
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

export const getOne = (sql, params = []) => {
  try {
    return db.prepare(sql).get(params);
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

export default db;