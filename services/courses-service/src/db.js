const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'courses.sqlite3');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    instructor_id TEXT NOT NULL,
    enrolled_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content_url TEXT,
    duration_minutes INTEGER DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES courses(id)
  )
`);

module.exports = db;
