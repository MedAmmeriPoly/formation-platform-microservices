const typeDefs = `#graphql
  enum Role {
    STUDENT
    INSTRUCTOR
  }

  enum EnrollmentStatus {
    IN_PROGRESS
    COMPLETED
    CANCELLED
  }

  type User {
    id: String!
    full_name: String!
    email: String!
    role: Role!
    created_at: String!
  }

  type Lesson {
    id: String!
    title: String!
    content_url: String
    duration_minutes: Int
  }

  type Course {
    id: String!
    title: String!
    description: String
    instructor_id: String!
    enrolled_count: Int
    created_at: String!
    lessons: [Lesson!]!
  }

  type Enrollment {
    id: String!
    student_id: String!
    course_id: String!
    status: EnrollmentStatus!
    progress_percent: Int
    completed_lesson_ids: [String!]!
    enrolled_at: String!
    completed_at: String
  }

  type Query {
    user(id: String!): User
    users(page: Int, page_size: Int): [User!]!
    course(id: String!): Course
    courses(page: Int, page_size: Int): [Course!]!
    enrollmentsByStudent(student_id: String!): [Enrollment!]!
    enrollmentsByCourse(course_id: String!): [Enrollment!]!
  }

  type Mutation {
    createUser(full_name: String!, email: String!, password: String!, role: Role): User
    createCourse(title: String!, description: String, instructor_id: String!): Course
    addLesson(course_id: String!, title: String!, content_url: String, duration_minutes: Int): Lesson
    enrollStudent(student_id: String!, course_id: String!): Enrollment
    updateProgress(enrollment_id: String!, completed_lesson_id: String, progress_percent: Int): Enrollment
    completeCourse(enrollment_id: String!): Enrollment
  }
`;

module.exports = typeDefs;
