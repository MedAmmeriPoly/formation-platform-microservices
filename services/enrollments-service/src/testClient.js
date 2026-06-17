const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '..', '..', '..', 'proto', 'enrollments.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: Number,
  defaults: true,
  oneofs: true,
});

const enrollmentsProto = grpc.loadPackageDefinition(packageDefinition).enrollments;
const client = new enrollmentsProto.EnrollmentsService(
  'localhost:50053',
  grpc.credentials.createInsecure()
);

// 1. Inscrire un etudiant a un cours
client.EnrollStudent(
  { student_id: 'student-001', course_id: 'course-001' },
  (err, response) => {
    if (err) {
      console.error('Erreur EnrollStudent:', err.message);
      return;
    }
    console.log('EnrollStudent ->', response);

    const enrollmentId = response.enrollment.id;

    // 2. Mettre a jour la progression
    client.UpdateProgress(
      {
        enrollment_id: enrollmentId,
        completed_lesson_id: 'lesson-001',
        progress_percent: 50,
      },
      (err2, response2) => {
        if (err2) {
          console.error('Erreur UpdateProgress:', err2.message);
          return;
        }
        console.log('UpdateProgress ->', response2);

        // 3. Terminer le cours
        client.CompleteCourse({ enrollment_id: enrollmentId }, (err3, response3) => {
          if (err3) {
            console.error('Erreur CompleteCourse:', err3.message);
            return;
          }
          console.log('CompleteCourse ->', response3);
        });
      }
    );

    // 4. Lister les inscriptions de cet etudiant
    client.ListEnrollmentsByStudent({ student_id: 'student-001' }, (err4, response4) => {
      if (err4) {
        console.error('Erreur ListEnrollmentsByStudent:', err4.message);
        return;
      }
      console.log('ListEnrollmentsByStudent ->', response4);
    });
  }
);
