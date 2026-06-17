const { v4: uuidv4 } = require('uuid');
const { getDb } = require('./db');

async function enrollStudent({ student_id, course_id }) {
  const db = await getDb();
  const id = uuidv4();
  const enrolled_at = new Date().toISOString();

  const doc = await db.enrollments.insert({
    id,
    student_id,
    course_id,
    status: 'IN_PROGRESS',
    progress_percent: 0,
    completed_lesson_ids: [],
    enrolled_at,
    completed_at: '',
  });

  return docToProto(doc);
}

async function getEnrollmentById(id) {
  const db = await getDb();
  const doc = await db.enrollments.findOne(id).exec();
  return doc ? docToProto(doc) : null;
}

async function listByStudent(student_id) {
  const db = await getDb();
  const docs = await db.enrollments.find({ selector: { student_id } }).exec();
  return docs.map(docToProto);
}

async function listByCourse(course_id) {
  const db = await getDb();
  const docs = await db.enrollments.find({ selector: { course_id } }).exec();
  return docs.map(docToProto);
}

async function updateProgress({ enrollment_id, completed_lesson_id, progress_percent }) {
  const db = await getDb();
  const doc = await db.enrollments.findOne(enrollment_id).exec();
  if (!doc) return null;

  const lessonIds = new Set(doc.completed_lesson_ids || []);
  if (completed_lesson_id) lessonIds.add(completed_lesson_id);

  await doc.patch({
    completed_lesson_ids: Array.from(lessonIds),
    progress_percent: progress_percent || doc.progress_percent,
  });

  const updated = await db.enrollments.findOne(enrollment_id).exec();
  return docToProto(updated);
}

async function completeCourse(enrollment_id) {
  const db = await getDb();
  const doc = await db.enrollments.findOne(enrollment_id).exec();
  if (!doc) return null;

  await doc.patch({
    status: 'COMPLETED',
    progress_percent: 100,
    completed_at: new Date().toISOString(),
  });

  const updated = await db.enrollments.findOne(enrollment_id).exec();
  return docToProto(updated);
}

function docToProto(doc) {
  const data = doc.toJSON ? doc.toJSON() : doc;
  const statusMap = { IN_PROGRESS: 0, COMPLETED: 1, CANCELLED: 2 };
  return {
    id: data.id,
    student_id: data.student_id,
    course_id: data.course_id,
    status: statusMap[data.status] ?? 0,
    progress_percent: data.progress_percent,
    completed_lesson_ids: data.completed_lesson_ids || [],
    enrolled_at: data.enrolled_at,
    completed_at: data.completed_at || '',
  };
}

module.exports = {
  enrollStudent,
  getEnrollmentById,
  listByStudent,
  listByCourse,
  updateProgress,
  completeCourse,
};
