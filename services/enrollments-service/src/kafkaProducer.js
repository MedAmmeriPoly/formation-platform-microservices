const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'enrollments-service',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();
let isConnected = false;

async function connectProducer() {
  if (isConnected) return;
  await producer.connect();
  isConnected = true;
  console.log('[Kafka] Producteur Enrollments connecte');
}

async function publishEnrollmentCreated(enrollment) {
  await connectProducer();

  await producer.send({
    topic: 'enrollment.created',
    messages: [
      {
        key: enrollment.id,
        value: JSON.stringify({
          enrollment_id: enrollment.id,
          student_id: enrollment.student_id,
          course_id: enrollment.course_id,
          enrolled_at: enrollment.enrolled_at,
        }),
      },
    ],
  });

  console.log(`[Kafka] Evenement enrollment.created publie pour l'inscription ${enrollment.id}`);
}

async function publishCourseCompleted(enrollment) {
  await connectProducer();

  await producer.send({
    topic: 'course.completed',
    messages: [
      {
        key: enrollment.id,
        value: JSON.stringify({
          enrollment_id: enrollment.id,
          student_id: enrollment.student_id,
          course_id: enrollment.course_id,
          completed_at: enrollment.completed_at,
        }),
      },
    ],
  });

  console.log(`[Kafka] Evenement course.completed publie pour l'inscription ${enrollment.id}`);
}

module.exports = {
  publishEnrollmentCreated,
  publishCourseCompleted,
};
