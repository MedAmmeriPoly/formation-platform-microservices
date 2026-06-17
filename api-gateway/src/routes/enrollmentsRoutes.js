const express = require('express');
const enrollmentsClient = require('../enrollmentsClient');

const router = express.Router();

function handleGrpcError(err, res) {
  const grpcToHttp = { 3: 400, 5: 404, 6: 409 };
  const status = grpcToHttp[err.code] || 500;
  res.status(status).json({ success: false, message: err.message || 'Erreur interne' });
}

// POST /api/enrollments - Inscrire un etudiant a un cours
router.post('/', async (req, res) => {
  try {
    const { student_id, course_id } = req.body;
    const response = await enrollmentsClient.enrollStudent({ student_id, course_id });
    res.status(201).json(response);
  } catch (err) {
    handleGrpcError(err, res);
  }
});

// GET /api/enrollments/:id - Recuperer une inscription
router.get('/:id', async (req, res) => {
  try {
    const response = await enrollmentsClient.getEnrollment({ id: req.params.id });
    res.json(response);
  } catch (err) {
    handleGrpcError(err, res);
  }
});

// GET /api/enrollments?student_id=... - Lister les inscriptions d'un etudiant
router.get('/', async (req, res) => {
  try {
    const { student_id, course_id } = req.query;
    if (student_id) {
      const response = await enrollmentsClient.listEnrollmentsByStudent({ student_id });
      return res.json(response);
    }
    if (course_id) {
      const response = await enrollmentsClient.listEnrollmentsByCourse({ course_id });
      return res.json(response);
    }
    res.status(400).json({ success: false, message: 'student_id ou course_id requis en query param' });
  } catch (err) {
    handleGrpcError(err, res);
  }
});

// PATCH /api/enrollments/:id/progress - Mettre a jour la progression
router.patch('/:id/progress', async (req, res) => {
  try {
    const { completed_lesson_id, progress_percent } = req.body;
    const response = await enrollmentsClient.updateProgress({
      enrollment_id: req.params.id,
      completed_lesson_id,
      progress_percent,
    });
    res.json(response);
  } catch (err) {
    handleGrpcError(err, res);
  }
});

// PATCH /api/enrollments/:id/complete - Marquer un cours comme termine
router.patch('/:id/complete', async (req, res) => {
  try {
    const response = await enrollmentsClient.completeCourse({ enrollment_id: req.params.id });
    res.json(response);
  } catch (err) {
    handleGrpcError(err, res);
  }
});

module.exports = router;
