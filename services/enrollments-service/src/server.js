const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const enrollmentService = require('./enrollmentService');

const PROTO_PATH = path.join(__dirname, '..', '..', '..', 'proto', 'enrollments.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: Number,
  defaults: true,
  oneofs: true,
});

const enrollmentsProto = grpc.loadPackageDefinition(packageDefinition).enrollments;

async function EnrollStudent(call, callback) {
  try {
    const { student_id, course_id } = call.request;
    if (!student_id || !course_id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'student_id et course_id sont obligatoires',
      });
    }
    const enrollment = await enrollmentService.enrollStudent({ student_id, course_id });
    callback(null, { success: true, message: 'Inscription creee avec succes', enrollment });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function GetEnrollment(call, callback) {
  try {
    const enrollment = await enrollmentService.getEnrollmentById(call.request.id);
    if (!enrollment) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Inscription introuvable' });
    }
    callback(null, { success: true, message: 'OK', enrollment });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function ListEnrollmentsByStudent(call, callback) {
  try {
    const enrollments = await enrollmentService.listByStudent(call.request.student_id);
    callback(null, { success: true, enrollments, total: enrollments.length });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function ListEnrollmentsByCourse(call, callback) {
  try {
    const enrollments = await enrollmentService.listByCourse(call.request.course_id);
    callback(null, { success: true, enrollments, total: enrollments.length });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function UpdateProgress(call, callback) {
  try {
    const enrollment = await enrollmentService.updateProgress(call.request);
    if (!enrollment) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Inscription introuvable' });
    }
    callback(null, { success: true, message: 'Progression mise a jour', enrollment });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

async function CompleteCourse(call, callback) {
  try {
    const enrollment = await enrollmentService.completeCourse(call.request.enrollment_id);
    if (!enrollment) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Inscription introuvable' });
    }
    callback(null, { success: true, message: 'Cours termine avec succes', enrollment });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function main() {
  const server = new grpc.Server();

  server.addService(enrollmentsProto.EnrollmentsService.service, {
    EnrollStudent,
    GetEnrollment,
    ListEnrollmentsByStudent,
    ListEnrollmentsByCourse,
    UpdateProgress,
    CompleteCourse,
  });

  const PORT = process.env.PORT || '50053';
  server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Enrollments service en ecoute sur le port ${PORT}`);
  });
}

main();
