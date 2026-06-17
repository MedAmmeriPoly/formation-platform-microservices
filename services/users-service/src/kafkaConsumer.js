const { Kafka } = require('kafkajs');
const db = require('./db');

const kafka = new Kafka({
  clientId: 'users-service',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'users-service-group' });

// Ajoute une colonne pour suivre le nombre de cours termines, si elle n'existe pas
function ensureCertificatesColumn() {
  const columns = db.prepare("PRAGMA table_info(users)").all();
  const hasColumn = columns.some((col) => col.name === 'completed_courses_count');
  if (!hasColumn) {
    db.exec('ALTER TABLE users ADD COLUMN completed_courses_count INTEGER NOT NULL DEFAULT 0');
  }
}

async function startConsumer() {
  ensureCertificatesColumn();

  await consumer.connect();
  console.log('[Kafka] Consommateur Users connecte');

  await consumer.subscribe({ topic: 'course.completed', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const payload = JSON.parse(message.value.toString());
        console.log(`[Kafka] Evenement recu sur ${topic}:`, payload);

        if (topic === 'course.completed') {
          const result = db
            .prepare('UPDATE users SET completed_courses_count = completed_courses_count + 1 WHERE id = ?')
            .run(payload.student_id);

          if (result.changes > 0) {
            console.log(
              `[Kafka] Badge/certificat comptabilise pour l'etudiant ${payload.student_id} (cours ${payload.course_id})`
            );
          } else {
            console.warn(`[Kafka] Etudiant ${payload.student_id} introuvable`);
          }
        }
      } catch (err) {
        console.error('[Kafka] Erreur traitement message:', err.message);
      }
    },
  });
}

module.exports = { startConsumer };
