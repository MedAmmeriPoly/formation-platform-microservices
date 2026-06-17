const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const courseService = require('./courseService');

const PROTO_PATH = path.join(__dirname, '..', '..', '..', 'proto', 'courses.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: Number,
  defaults: true,
  oneofs: true,
});

const coursesProto = grpc.loadPackageDefinition(packageDefinition).courses;

function CreateCourse(call, callback) {
  try {
    const { title, description, instructor_id } = call.request;
    if (!title || !instructor_id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'title et instructor_id sont obligatoires',
      });
    }
    const course = courseService.createCourse({ title, description, instructor_id });
    callback(null, { success: true, message: 'Cours cree avec succes', course });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function GetCourse(call, callback) {
  try {
    const course = courseService.getCourseById(call.request.id);
    if (!course) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Cours introuvable' });
    }
    callback(null, { success: true, message: 'OK', course });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function ListCourses(call, callback) {
  try {
    const { instructor_id_filter, page, page_size } = call.request;
    const { courses, total } = courseService.listCourses({
      instructorIdFilter: instructor_id_filter,
      page: page || 1,
      pageSize: page_size || 20,
    });
    callback(null, { success: true, courses, total });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function UpdateCourse(call, callback) {
  try {
    const course = courseService.updateCourse(call.request);
    if (!course) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Cours introuvable' });
    }
    callback(null, { success: true, message: 'Cours mis a jour', course });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function DeleteCourse(call, callback) {
  try {
    const deleted = courseService.deleteCourse(call.request.id);
    if (!deleted) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Cours introuvable' });
    }
    callback(null, { success: true, message: 'Cours supprime' });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function AddLesson(call, callback) {
  try {
    const lesson = courseService.addLesson(call.request);
    if (!lesson) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Cours introuvable' });
    }
    callback(null, { success: true, message: 'Lecon ajoutee', lesson });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function IncrementEnrollmentCount(call, callback) {
  try {
    const course = courseService.incrementEnrollmentCount(call.request.course_id);
    if (!course) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Cours introuvable' });
    }
    callback(null, { success: true, message: 'Compteur incremente', course });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function main() {
  const server = new grpc.Server();

  server.addService(coursesProto.CoursesService.service, {
    CreateCourse,
    GetCourse,
    ListCourses,
    UpdateCourse,
    DeleteCourse,
    AddLesson,
    IncrementEnrollmentCount,
  });

  const PORT = process.env.PORT || '50052';
  server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Courses service en ecoute sur le port ${PORT}`);
  });
}

main();
