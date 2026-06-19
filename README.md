# Plateforme de formation en ligne — Architecture Microservices

**Module** : SoA et Microservices | **A.U.** : 2025-26 | **Auteur** : Med Ammeri

---

## Description

Plateforme de formation en ligne développée en Node.js, basée sur une architecture microservices complète comprenant trois microservices indépendants, une API Gateway REST/GraphQL, une communication inter-services via Apache Kafka, et des appels internes en gRPC (Protobuf/HTTP2).

---

## Architecture

```
Client (Postman / Web)
        │
        │  REST + GraphQL (HTTP/1.1 + JSON)
        ▼
┌─────────────────┐
│   API Gateway   │  :4000
│  Express + Apollo│
└────────┬────────┘
         │ gRPC (HTTP/2 + Protobuf)
    ┌────┼────┐
    ▼    ▼    ▼
┌───────┐ ┌────────┐ ┌────────────┐
│ Users │ │Courses │ │Enrollments │
│ :50051│ │ :50052 │ │   :50053   │
└───┬───┘ └───┬────┘ └─────┬──────┘
    │         │             │
    │  SQLite3│  SQLite3    │  RxDB
    │         │             │
    └────────►Kafka Broker◄─┘
              :9092
```

---

## Technologies utilisées

| Composant | Technologie |
|-----------|-------------|
| Langage | Node.js |
| Communication interne | gRPC (HTTP/2 + Protobuf) |
| API externe REST | Express.js |
| API externe GraphQL | Apollo Server |
| Messaging async | Apache Kafka (KafkaJS) |
| Base de données SQL | SQLite3 (better-sqlite3) |
| Base de données NoSQL | RxDB (storage mémoire) |
| Conteneurisation Kafka | Docker / Docker Compose |

---

## Microservices

### Users service (port 50051)
- Gestion des comptes utilisateurs (étudiants et formateurs)
- Base de données : **SQLite3** (`users.sqlite3`)
- Produit : `user.registered` | Consomme : `course.completed`

### Courses service (port 50052)
- Gestion des cours, modules et leçons
- Base de données : **SQLite3** (`courses.sqlite3`)
- Consomme : `enrollment.created`

### Enrollments service (port 50053)
- Gestion des inscriptions et de la progression
- Base de données : **RxDB** (NoSQL, stockage mémoire)
- Produit : `enrollment.created`, `course.completed` | Consomme : `user.registered`

---

## Topics Kafka

| Topic | Producteur | Consommateur | Déclencheur |
|-------|-----------|--------------|-------------|
| `user.registered` | Users | Enrollments | Création d'un compte |
| `enrollment.created` | Enrollments | Courses | Inscription à un cours |
| `course.completed` | Enrollments | Users | Complétion d'un cours |

---

## Fichiers .proto

Contrats gRPC dans `/proto` :
- `users.proto` — CreateUser, GetUser, ListUsers, UpdateUser, DeleteUser
- `courses.proto` — CreateCourse, GetCourse, ListCourses, UpdateCourse, DeleteCourse, AddLesson, IncrementEnrollmentCount
- `enrollments.proto` — EnrollStudent, GetEnrollment, ListEnrollmentsByStudent, ListEnrollmentsByCourse, UpdateProgress, CompleteCourse

---

## Installation et exécution

### Prérequis
- Node.js v18+
- Docker Desktop

### 1. Cloner le repository
```bash
git clone https://github.com/MedAmmeriPoly/formation-platform-microservices.git
cd formation-platform-microservices
```

### 2. Lancer Kafka
```bash
docker compose up -d
docker compose ps
```

### 3. Installer les dépendances
```bash
cd services/users-service && npm install && cd ../..
cd services/courses-service && npm install && cd ../..
cd services/enrollments-service && npm install && cd ../..
cd api-gateway && npm install && cd ..
```

### 4. Lancer les services (4 terminaux séparés)
```bash
# Terminal 1
cd services/users-service && node src/server.js

# Terminal 2
cd services/courses-service && node src/server.js

# Terminal 3
cd services/enrollments-service && node src/server.js

# Terminal 4
cd api-gateway && node src/server.js
```

### 5. Tester
- REST : `http://localhost:4000/api/{users|courses|enrollments}`
- GraphQL : `http://localhost:4000/graphql`
- Importer `docs/postman_collection.json` dans Postman

---

## Bases de données

| Service | Type | Technologie | Stockage |
|---------|------|-------------|---------|
| Users | SQL | SQLite3 | `users.sqlite3` |
| Courses | SQL | SQLite3 | `courses.sqlite3` |
| Enrollments | NoSQL | RxDB | Mémoire |

---

## Structure du repository

```
formation-platform-microservices/
├── api-gateway/src/
│   ├── server.js, usersClient.js, coursesClient.js, enrollmentsClient.js
│   ├── routes/ (usersRoutes.js, coursesRoutes.js, enrollmentsRoutes.js)
│   └── graphql/ (typeDefs.js, resolvers.js)
├── services/
│   ├── users-service/src/ (server.js, userService.js, db.js, kafkaProducer.js, kafkaConsumer.js)
│   ├── courses-service/src/ (server.js, courseService.js, db.js, kafkaConsumer.js)
│   └── enrollments-service/src/ (server.js, enrollmentService.js, db.js, kafkaProducer.js, kafkaUserConsumer.js)
├── proto/ (users.proto, courses.proto, enrollments.proto)
├── docs/ (postman_collection.json)
├── docker-compose.yml
└── README.md
```
