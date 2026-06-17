const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '..', '..', 'proto', 'courses.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: Number,
  defaults: true,
  oneofs: true,
});

const coursesProto = grpc.loadPackageDefinition(packageDefinition).courses;

const coursesClient = new coursesProto.CoursesService(
  process.env.COURSES_SERVICE_URL || 'localhost:50052',
  grpc.credentials.createInsecure()
);

function promisify(method) {
  return (request) =>
    new Promise((resolve, reject) => {
      coursesClient[method](request, (err, response) => {
        if (err) return reject(err);
        resolve(response);
      });
    });
}

module.exports = {
  createCourse: promisify('CreateCourse'),
  getCourse: promisify('GetCourse'),
  listCourses: promisify('ListCourses'),
  updateCourse: promisify('UpdateCourse'),
  deleteCourse: promisify('DeleteCourse'),
  addLesson: promisify('AddLesson'),
  incrementEnrollmentCount: promisify('IncrementEnrollmentCount'),
};
