const usersClient = require('../usersClient');
const coursesClient = require('../coursesClient');
const enrollmentsClient = require('../enrollmentsClient');

const ROLE_ENUM = ['STUDENT', 'INSTRUCTOR'];
const STATUS_ENUM = ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

// Convertit les enums numeriques renvoyes par gRPC en chaines lisibles pour GraphQL
function mapUser(user) {
  if (!user) return null;
  return { ...user, role: ROLE_ENUM[user.role] || 'STUDENT' };
}

function mapEnrollment(enrollment) {
  if (!enrollment) return null;
  return { ...enrollment, status: STATUS_ENUM[enrollment.status] || 'IN_PROGRESS' };
}

const resolvers = {
  Query: {
    user: async (_, { id }) => {
      const res = await usersClient.getUser({ id });
      return mapUser(res.user);
    },
    users: async (_, { page, page_size }) => {
      const res = await usersClient.listUsers({ page: page || 1, page_size: page_size || 20 });
      return res.users.map(mapUser);
    },
    course: async (_, { id }) => {
      const res = await coursesClient.getCourse({ id });
      return res.course;
    },
    courses: async (_, { page, page_size }) => {
      const res = await coursesClient.listCourses({ page: page || 1, page_size: page_size || 20 });
      return res.courses;
    },
    enrollmentsByStudent: async (_, { student_id }) => {
      const res = await enrollmentsClient.listEnrollmentsByStudent({ student_id });
      return res.enrollments.map(mapEnrollment);
    },
    enrollmentsByCourse: async (_, { course_id }) => {
      const res = await enrollmentsClient.listEnrollmentsByCourse({ course_id });
      return res.enrollments.map(mapEnrollment);
    },
  },

  Mutation: {
    createUser: async (_, { full_name, email, password, role }) => {
      const roleValue = role === 'INSTRUCTOR' ? 1 : 0;
      const res = await usersClient.createUser({ full_name, email, password, role: roleValue });
      return mapUser(res.user);
    },
    createCourse: async (_, { title, description, instructor_id }) => {
      const res = await coursesClient.createCourse({ title, description, instructor_id });
      return res.course;
    },
    addLesson: async (_, { course_id, title, content_url, duration_minutes }) => {
      const res = await coursesClient.addLesson({ course_id, title, content_url, duration_minutes });
      return res.lesson;
    },
    enrollStudent: async (_, { student_id, course_id }) => {
      const res = await enrollmentsClient.enrollStudent({ student_id, course_id });
      return mapEnrollment(res.enrollment);
    },
    updateProgress: async (_, { enrollment_id, completed_lesson_id, progress_percent }) => {
      const res = await enrollmentsClient.updateProgress({
        enrollment_id,
        completed_lesson_id,
        progress_percent,
      });
      return mapEnrollment(res.enrollment);
    },
    completeCourse: async (_, { enrollment_id }) => {
      const res = await enrollmentsClient.completeCourse({ enrollment_id });
      return mapEnrollment(res.enrollment);
    },
  },
};

module.exports = resolvers;
