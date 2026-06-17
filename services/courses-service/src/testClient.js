const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '..', '..', '..', 'proto', 'courses.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: Number,
  defaults: true,
  oneofs: true,
});

const coursesProto = grpc.loadPackageDefinition(packageDefinition).courses;
const client = new coursesProto.CoursesService(
  'localhost:50052',
  grpc.credentials.createInsecure()
);

// 1. Creer un cours
client.CreateCourse(
  {
    title: 'Introduction a Node.js',
    description: 'Apprenez les bases de Node.js pas a pas',
    instructor_id: 'instructor-001',
  },
  (err, response) => {
    if (err) {
      console.error('Erreur CreateCourse:', err.message);
      return;
    }
    console.log('CreateCourse ->', response);

    const courseId = response.course.id;

    // 2. Ajouter une lecon a ce cours
    client.AddLesson(
      {
        course_id: courseId,
        title: 'Installation et premier serveur',
        content_url: 'https://example.com/lesson1',
        duration_minutes: 15,
      },
      (err2, response2) => {
        if (err2) {
          console.error('Erreur AddLesson:', err2.message);
          return;
        }
        console.log('AddLesson ->', response2);

        // 3. Recuperer le cours avec sa lecon
        client.GetCourse({ id: courseId }, (err3, response3) => {
          if (err3) {
            console.error('Erreur GetCourse:', err3.message);
            return;
          }
          console.log('GetCourse ->', response3);
        });
      }
    );

    // 4. Lister tous les cours
    client.ListCourses({ page: 1, page_size: 10 }, (err4, response4) => {
      if (err4) {
        console.error('Erreur ListCourses:', err4.message);
        return;
      }
      console.log('ListCourses ->', response4);
    });
  }
);
