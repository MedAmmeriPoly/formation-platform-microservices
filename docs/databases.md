# Description des bases de données

---

## Users service — SQLite3

**Fichier** : `services/users-service/users.sqlite3`
**Technologie** : SQLite3 via `better-sqlite3`

### Table `users`

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID généré automatiquement |
| `full_name` | TEXT | NOT NULL | Nom complet de l'utilisateur |
| `email` | TEXT | UNIQUE NOT NULL | Email unique |
| `password` | TEXT | NOT NULL | Mot de passe |
| `role` | TEXT | CHECK (STUDENT/INSTRUCTOR) | Rôle de l'utilisateur |
| `created_at` | TEXT | NOT NULL | Date de création (ISO 8601) |
| `completed_courses_count` | INTEGER | DEFAULT 0 | Nombre de cours complétés (badge) |

**Justification SQL** : Les données utilisateurs sont structurées et relationnelles (contraintes d'unicité sur l'email, validation du rôle) — SQLite3 est parfaitement adapté pour ce type de données.

---

## Courses service — SQLite3

**Fichier** : `services/courses-service/courses.sqlite3`
**Technologie** : SQLite3 via `better-sqlite3`

### Table `courses`

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID généré automatiquement |
| `title` | TEXT | NOT NULL | Titre du cours |
| `description` | TEXT | — | Description du cours |
| `instructor_id` | TEXT | NOT NULL | ID du formateur |
| `enrolled_count` | INTEGER | DEFAULT 0 | Nombre d'inscrits (mis à jour par Kafka) |
| `created_at` | TEXT | NOT NULL | Date de création (ISO 8601) |

### Table `lessons`

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID généré automatiquement |
| `course_id` | TEXT | FOREIGN KEY | Référence vers `courses.id` |
| `title` | TEXT | NOT NULL | Titre de la leçon |
| `content_url` | TEXT | — | URL du contenu |
| `duration_minutes` | INTEGER | DEFAULT 0 | Durée en minutes |

**Justification SQL** : Les cours et leçons ont une relation parent-enfant bien définie (clé étrangère), ce qui justifie le modèle relationnel SQL.

---

## Enrollments service — RxDB (NoSQL)

**Technologie** : RxDB avec `getRxStorageMemory()`
**Mode** : Stockage en mémoire (données non persistées après redémarrage)

### Collection `enrollments`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | string (primaryKey) | UUID de l'inscription |
| `student_id` | string | ID de l'étudiant |
| `course_id` | string | ID du cours |
| `status` | string (enum) | IN_PROGRESS / COMPLETED / CANCELLED |
| `progress_percent` | number | Pourcentage de complétion (0-100) |
| `completed_lesson_ids` | string[] | Liste des IDs de leçons complétées |
| `enrolled_at` | string | Date d'inscription (ISO 8601) |
| `completed_at` | string | Date de complétion (ISO 8601) |

**Justification NoSQL** : Les données de progression sont flexibles et variables (liste dynamique de leçons complétées, statuts évolutifs) — un modèle document NoSQL est plus adapté qu'un schéma SQL rigide pour ce type de données semi-structurées. RxDB offre aussi une validation de schéma JSON intégrée via AJV, garantissant l'intégrité des données malgré la flexibilité du stockage.

> **Note technique** : Le stockage mémoire (`getRxStorageMemory()`) a été choisi pour la simplicité d'implémentation et la compatibilité Node.js sans dépendances natives supplémentaires. Le stockage persistant (fichier SQLite ou filesystem) est disponible via les plugins premium de RxDB.
