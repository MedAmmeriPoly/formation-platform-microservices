const { createRxDatabase, addRxPlugin } = require('rxdb');
const { getRxStorageMemory } = require('rxdb/plugins/storage-memory');
const { wrappedValidateAjvStorage } = require('rxdb/plugins/validate-ajv');
const { RxDBDevModePlugin } = require('rxdb/plugins/dev-mode');

// Le dev-mode plugin donne des erreurs plus claires pendant le developpement
addRxPlugin(RxDBDevModePlugin);

// En dev-mode, RxDB exige un storage avec validation de schema active
const storage = wrappedValidateAjvStorage({ storage: getRxStorageMemory() });

const enrollmentSchema = {
  title: 'enrollment schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    student_id: { type: 'string' },
    course_id: { type: 'string' },
    status: { type: 'string', enum: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'IN_PROGRESS' },
    progress_percent: { type: 'number', default: 0 },
    completed_lesson_ids: {
      type: 'array',
      items: { type: 'string' },
    },
    enrolled_at: { type: 'string' },
    completed_at: { type: 'string' },
  },
  required: ['id', 'student_id', 'course_id', 'status', 'enrolled_at'],
};

let dbInstance = null;

async function getDb() {
  if (dbInstance) return dbInstance;

  dbInstance = await createRxDatabase({
    name: 'enrollmentsdb',
    storage,
    ignoreDuplicate: true,
  });

  await dbInstance.addCollections({
    enrollments: { schema: enrollmentSchema },
  });

  return dbInstance;
}

module.exports = { getDb };
