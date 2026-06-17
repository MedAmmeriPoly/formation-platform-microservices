const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '..', '..', 'proto', 'enrollments.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: Number,
  defaults: true,
  oneofs: true,
});

const enrollmentsProto = grpc.loadPackageDefinition(packageDefinition).enrollments;

const enrollmentsClient = new enrollmentsProto.EnrollmentsService(
  process.env.ENROLLMENTS_SERVICE_URL || 'localhost:50053',
  grpc.credentials.createInsecure()
);

function promisify(method) {
  return (request) =>
    new Promise((resolve, reject) => {
      enrollmentsClient[method](request, (err, response) => {
        if (err) return reject(err);
        resolve(response);
      });
    });
}

module.exports = {
  enrollStudent: promisify('EnrollStudent'),
  getEnrollment: promisify('GetEnrollment'),
  listEnrollmentsByStudent: promisify('ListEnrollmentsByStudent'),
  listEnrollmentsByCourse: promisify('ListEnrollmentsByCourse'),
  updateProgress: promisify('UpdateProgress'),
  completeCourse: promisify('CompleteCourse'),
};
