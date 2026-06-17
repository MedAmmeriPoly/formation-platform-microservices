const { Kafka } = require('kafkajs');
const courseService = require('./courseService');

const kafka = new Kafka({
  clientId: 'courses-service',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'courses-service-group' });

async function startConsumer() {
  await consumer.connect();
  console.log('[Kafka] Consommateur Courses connecte');

  await consumer.subscribe({ topic: 'enrollment.created', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const payload = JSON.parse(message.value.toString());
        console.log(`[Kafka] Evenement recu sur ${topic}:`, payload);

        if (topic === 'enrollment.created') {
          const updatedCourse = courseService.incrementEnrollmentCount(payload.course_id);
          if (updatedCourse) {
            console.log(
              `[Kafka] Compteur d'inscrits incremente pour le cours ${payload.course_id} -> ${updatedCourse.enrolled_count}`
            );
          } else {
            console.warn(`[Kafka] Cours ${payload.course_id} introuvable, compteur non incremente`);
          }
        }
      } catch (err) {
        console.error('[Kafka] Erreur traitement message:', err.message);
      }
    },
  });
}

module.exports = { startConsumer };
