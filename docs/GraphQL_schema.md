# Schéma GraphQL

Endpoint : `POST http://localhost:4000/graphql`

---

## Types

```graphql
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
```

---

## Queries disponibles

```graphql
type Query {
  user(id: String!): User
  users(page: Int, page_size: Int): [User!]!
  course(id: String!): Course
  courses(page: Int, page_size: Int): [Course!]!
  enrollmentsByStudent(student_id: String!): [Enrollment!]!
  enrollmentsByCourse(course_id: String!): [Enrollment!]!
}
```

---

## Mutations disponibles

```graphql
type Mutation {
  createUser(full_name: String!, email: String!, password: String!, role: Role): User
  createCourse(title: String!, description: String, instructor_id: String!): Course
  addLesson(course_id: String!, title: String!, content_url: String, duration_minutes: Int): Lesson
  enrollStudent(student_id: String!, course_id: String!): Enrollment
  updateProgress(enrollment_id: String!, completed_lesson_id: String, progress_percent: Int): Enrollment
  completeCourse(enrollment_id: String!): Enrollment
}
```

---

## Exemples de requêtes

### Query — Lister les utilisateurs (sélection de champs précise)

```graphql
{
  users(page: 1, page_size: 10) {
    id
    full_name
    email
    role
  }
}
```

### Query — Cours avec leçons imbriquées

```graphql
query GetCourse($id: String!) {
  course(id: $id) {
    id
    title
    description
    enrolled_count
    lessons {
      id
      title
      duration_minutes
    }
  }
}
```

### Mutation — Créer un utilisateur

```graphql
mutation CreateUser($full_name: String!, $email: String!, $password: String!, $role: Role) {
  createUser(full_name: $full_name, email: $email, password: $password, role: $role) {
    id
    full_name
    email
    role
  }
}
```

### Mutation — Inscrire un étudiant

```graphql
mutation Enroll($student_id: String!, $course_id: String!) {
  enrollStudent(student_id: $student_id, course_id: $course_id) {
    id
    status
    progress_percent
    enrolled_at
  }
}
```

---

## Justification de l'utilisation de GraphQL

GraphQL est utilisé dans ce projet pour permettre au client de demander précisément les champs dont il a besoin, sans sur-fetch ni under-fetch. Par exemple, une requête `course` peut récupérer en une seule requête le cours, ses leçons imbriquées et son nombre d'inscrits — ce qui nécessiterait plusieurs appels REST distincts autrement. GraphQL offre aussi une introspection native du schéma, utile pour la documentation automatique.
