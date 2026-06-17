const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'users.sqlite3');
const db = new Database(dbPath);

// Creation de la table si elle n'existe pas encore
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('STUDENT', 'INSTRUCTOR')),
    created_at TEXT NOT NULL
  )
`);

module.exports = db;
