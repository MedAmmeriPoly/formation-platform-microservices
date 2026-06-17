const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'enrollments-service',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'enrollments-service-group' });

async function startConsumer() {
  await consumer.connect();
  console.log('[Kafka] Consommateur Enrollments connecte');

  await consumer.subscribe({ topic: 'user.registered', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const payload = JSON.parse(message.value.toString());
        console.log(`[Kafka] Evenement recu sur ${topic}:`, payload);

        if (topic === 'user.registered') {
          // Le profil de progression sera cree automatiquement lors de la premiere
          // inscription a un cours (EnrollStudent). Ici on se contente de tracer
          // l'evenement pour demontrer le decouplage Users -> Enrollments.
          console.log(
            `[Kafka] Nouvel utilisateur ${payload.user_id} (${payload.full_name}) pret pour inscriptions futures`
          );
        }
      } catch (err) {
        console.error('[Kafka] Erreur traitement message:', err.message);
      }
    },
  });
}

module.exports = { startConsumer };
