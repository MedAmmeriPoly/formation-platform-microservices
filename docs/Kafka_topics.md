# Description des topics Kafka

Broker : `localhost:9092`
Mode : KRaft (sans Zookeeper)
Partitions par topic : 3
Replication factor : 1

---

## Topics

### 1. `user.registered`

**Producteur** : Users service
**Consommateur** : Enrollments service
**Groupe de consommateurs** : `enrollments-service-group`

**Déclencheur métier** : Émis automatiquement lorsqu'un nouvel utilisateur crée son compte sur la plateforme.

**Structure du message** :
```json
{
  "user_id": "b35a8162-c586-4b04-a6a1-a7bb2614ea96",
  "full_name": "Amine Ben Salah",
  "email": "amine@example.com",
  "role": 0,
  "created_at": "2026-06-17T08:59:32.084Z"
}
```

**Traitement côté consommateur** : Enrollments service reçoit l'événement et trace l'arrivée du nouvel utilisateur, en préparation de ses futures inscriptions.

---

### 2. `enrollment.created`

**Producteur** : Enrollments service
**Consommateur** : Courses service
**Groupe de consommateurs** : `courses-service-group`

**Déclencheur métier** : Émis automatiquement lorsqu'un étudiant s'inscrit à un cours via `EnrollStudent`.

**Structure du message** :
```json
{
  "enrollment_id": "dc0a26f4-7bd4-4d74-bcaa-242735931695",
  "student_id": "c4eeb53c-f803-4994-bc8b-69ca5d967d8c",
  "course_id": "02ed7da7-cea2-4da4-a13e-2c76101c6dbf",
  "enrolled_at": "2026-06-18T21:44:12.815Z"
}
```

**Traitement côté consommateur** : Courses service reçoit l'événement et incrémente automatiquement le compteur `enrolled_count` du cours concerné, sans appel gRPC direct entre les deux services — découplage total.

---

### 3. `course.completed`

**Producteur** : Enrollments service
**Consommateur** : Users service
**Groupe de consommateurs** : `users-service-group`

**Déclencheur métier** : Émis automatiquement lorsqu'un étudiant complète un cours via `CompleteCourse`.

**Structure du message** :
```json
{
  "enrollment_id": "dc0a26f4-7bd4-4d74-bcaa-242735931695",
  "student_id": "c4eeb53c-f803-4994-bc8b-69ca5d967d8c",
  "course_id": "02ed7da7-cea2-4da4-a13e-2c76101c6dbf",
  "completed_at": "2026-06-18T22:00:00.000Z"
}
```

**Traitement côté consommateur** : Users service reçoit l'événement et met à jour le profil de l'étudiant en incrémentant son compteur de cours complétés (`completed_courses_count`), ce qui représente l'obtention d'un badge/certificat.

---

## Schéma des flux événementiels

```
Users service ──────────────────────────────────────────►  user.registered  ──► Enrollments service
                                                                               (trace le nouvel utilisateur)

Enrollments service  ──────────────────────────────────►  enrollment.created ──► Courses service
                                                                                  (incrémente enrolled_count)

Enrollments service  ──────────────────────────────────►  course.completed   ──► Users service
                                                                                  (comptabilise le certificat)
```

---

## Justification de l'utilisation de Kafka

Kafka est utilisé pour **découpler les microservices** et éviter les appels gRPC directs entre eux pour les événements asynchrones. Par exemple, lorsqu'un étudiant s'inscrit, Enrollments n'a pas besoin d'attendre une réponse de Courses pour incrémenter son compteur — il publie l'événement et continue. Cela améliore la résilience (si Courses est temporairement indisponible, le message sera traité dès son retour) et la scalabilité du système.
