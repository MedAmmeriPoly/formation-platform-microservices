const { v4: uuidv4 } = require('uuid');
const db = require('./db');

function createCourse({ title, description, instructor_id }) {
  const id = uuidv4();
  const created_at = new Date().toISOString();

  db.prepare(`
    INSERT INTO courses (id, title, description, instructor_id, enrolled_count, created_at)
    VALUES (?, ?, ?, ?, 0, ?)
  `).run(id, title, description || '', instructor_id, created_at);

  return getCourseById(id);
}

function getCourseById(id) {
  const row = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
  if (!row) return null;

  const lessons = db.prepare('SELECT * FROM lessons WHERE course_id = ?').all(id);
  return rowToProto(row, lessons);
}

function listCourses({ instructorIdFilter, page = 1, pageSize = 20 }) {
  let rows;
  const offset = (page - 1) * pageSize;

  if (instructorIdFilter) {
    rows = db.prepare('SELECT * FROM courses WHERE instructor_id = ? LIMIT ? OFFSET ?')
      .all(instructorIdFilter, pageSize, offset);
  } else {
    rows = db.prepare('SELECT * FROM courses LIMIT ? OFFSET ?').all(pageSize, offset);
  }

  const total = db.prepare('SELECT COUNT(*) as count FROM courses').get().count;
  const courses = rows.map((row) => {
    const lessons = db.prepare('SELECT * FROM lessons WHERE course_id = ?').all(row.id);
    return rowToProto(row, lessons);
  });

  return { courses, total };
}

function updateCourse({ id, title, description }) {
  const existing = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
  if (!existing) return null;

  db.prepare('UPDATE courses SET title = ?, description = ? WHERE id = ?')
    .run(title || existing.title, description || existing.description, id);

  return getCourseById(id);
}

function deleteCourse(id) {
  db.prepare('DELETE FROM lessons WHERE course_id = ?').run(id);
  const result = db.prepare('DELETE FROM courses WHERE id = ?').run(id);
  return result.changes > 0;
}

function addLesson({ course_id, title, content_url, duration_minutes }) {
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(course_id);
  if (!course) return null;

  const id = uuidv4();
  db.prepare(`
    INSERT INTO lessons (id, course_id, title, content_url, duration_minutes)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, course_id, title, content_url || '', duration_minutes || 0);

  return db.prepare('SELECT * FROM lessons WHERE id = ?').get(id);
}

function incrementEnrollmentCount(course_id) {
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(course_id);
  if (!course) return null;

  db.prepare('UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = ?').run(course_id);
  return getCourseById(course_id);
}

function rowToProto(row, lessons) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    instructor_id: row.instructor_id,
    enrolled_count: row.enrolled_count,
    created_at: row.created_at,
    lessons: lessons.map((l) => ({
      id: l.id,
      title: l.title,
      content_url: l.content_url,
      duration_minutes: l.duration_minutes,
    })),
  };
}

module.exports = {
  createCourse,
  getCourseById,
  listCourses,
  updateCourse,
  deleteCourse,
  addLesson,
  incrementEnrollmentCount,
};
