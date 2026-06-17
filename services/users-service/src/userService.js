const { v4: uuidv4 } = require('uuid');
const db = require('./db');

function createUser({ full_name, email, password, role }) {
  const id = uuidv4();
  const created_at = new Date().toISOString();
  const roleValue = role === 1 ? 'INSTRUCTOR' : 'STUDENT';

  const stmt = db.prepare(`
    INSERT INTO users (id, full_name, email, password, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, full_name, email, password, roleValue, created_at);

  return getUserById(id);
}

function getUserById(id) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return row ? rowToProto(row) : null;
}

function listUsers({ roleFilter, page = 1, pageSize = 20 }) {
  let rows;
  const offset = (page - 1) * pageSize;

  if (roleFilter === 'STUDENT' || roleFilter === 'INSTRUCTOR') {
    rows = db.prepare('SELECT * FROM users WHERE role = ? LIMIT ? OFFSET ?')
      .all(roleFilter, pageSize, offset);
  } else {
    rows = db.prepare('SELECT * FROM users LIMIT ? OFFSET ?').all(pageSize, offset);
  }

  const total = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  return { users: rows.map(rowToProto), total };
}

function updateUser({ id, full_name, email }) {
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!existing) return null;

  db.prepare('UPDATE users SET full_name = ?, email = ? WHERE id = ?')
    .run(full_name || existing.full_name, email || existing.email, id);

  return getUserById(id);
}

function deleteUser(id) {
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return result.changes > 0;
}

// Convertit une ligne SQLite en objet compatible avec le message proto User
function rowToProto(row) {
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    role: row.role === 'INSTRUCTOR' ? 1 : 0,
    created_at: row.created_at,
  };
}

module.exports = {
  createUser,
  getUserById,
  listUsers,
  updateUser,
  deleteUser,
};
