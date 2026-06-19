# Description des endpoints REST

Base URL : `http://localhost:4000`

---

## Users

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| POST | `/api/users` | Créer un utilisateur | `{full_name, email, password, role}` |
| GET | `/api/users` | Lister les utilisateurs | Query: `page`, `page_size` |
| GET | `/api/users/:id` | Récupérer un utilisateur | — |
| PUT | `/api/users/:id` | Modifier un utilisateur | `{full_name, email}` |
| DELETE | `/api/users/:id` | Supprimer un utilisateur | — |

### Exemple — Créer un utilisateur

**Requête :**
```json
POST /api/users
{
  "full_name": "Amine Ben Salah",
  "email": "amine@example.com",
  "password": "motdepasse123",
  "role": 0
}
```

**Réponse (201 Created) :**
```json
{
  "success": true,
  "message": "Utilisateur cree avec succes",
  "user": {
    "id": "b35a8162-c586-4b04-a6a1-a7bb2614ea96",
    "full_name": "Amine Ben Salah",
    "email": "amine@example.com",
    "role": 0,
    "created_at": "2026-06-17T08:59:32.084Z"
  }
}
```

---

## Courses

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| POST | `/api/courses` | Créer un cours | `{title, description, instructor_id}` |
| GET | `/api/courses` | Lister les cours | Query: `page`, `page_size`, `instructor_id` |
| GET | `/api/courses/:id` | Récupérer un cours (avec leçons) | — |
| PUT | `/api/courses/:id` | Modifier un cours | `{title, description}` |
| DELETE | `/api/courses/:id` | Supprimer un cours | — |
| POST | `/api/courses/:id/lessons` | Ajouter une leçon | `{title, content_url, duration_minutes}` |

---

## Enrollments

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| POST | `/api/enrollments` | Inscrire un étudiant | `{student_id, course_id}` |
| GET | `/api/enrollments` | Lister les inscriptions | Query: `student_id` ou `course_id` |
| GET | `/api/enrollments/:id` | Récupérer une inscription | — |
| PATCH | `/api/enrollments/:id/progress` | Mettre à jour la progression | `{completed_lesson_id, progress_percent}` |
| PATCH | `/api/enrollments/:id/complete` | Terminer un cours | — |

---

## Codes de réponse HTTP

| Code | Signification |
|------|--------------|
| 200 | Succès |
| 201 | Ressource créée |
| 400 | Requête invalide (champ manquant) |
| 404 | Ressource introuvable |
| 409 | Conflit (email déjà existant) |
| 500 | Erreur interne |
