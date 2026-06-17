const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'users-service',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();
let isConnected = false;

async function connectProducer() {
  if (isConnected) return;
  await producer.connect();
  isConnected = true;
  console.log('[Kafka] Producteur Users connecte');
}

async function publishUserRegistered(user) {
  await connectProducer();

  await producer.send({
    topic: 'user.registered',
    messages: [
      {
        key: user.id,
        value: JSON.stringify({
          user_id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
        }),
      },
    ],
  });

  console.log(`[Kafka] Evenement user.registered publie pour l'utilisateur ${user.id}`);
}

module.exports = { publishUserRegistered };
