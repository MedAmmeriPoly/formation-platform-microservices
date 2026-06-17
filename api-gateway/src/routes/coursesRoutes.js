const express = require('express');
const coursesClient = require('../coursesClient');

const router = express.Router();

function handleGrpcError(err, res) {
  const grpcToHttp = { 3: 400, 5: 404, 6: 409 };
  const status = grpcToHttp[err.code] || 500;
  res.status(status).json({ success: false, message: err.message || 'Erreur interne' });
}

// POST /api/courses - Creer un cours
router.post('/', async (req, res) => {
  try {
    const { title, description, instructor_id } = req.body;
    const response = await coursesClient.createCourse({ title, description, instructor_id });
    res.status(201).json(response);
  } catch (err) {
    handleGrpcError(err, res);
  }
});

// GET /api/courses/:id - Recuperer un cours (avec ses lecons)
router.get('/:id', async (req, res) => {
  try {
    const response = await coursesClient.getCourse({ id: req.params.id });
    res.json(response);
  } catch (err) {
    handleGrpcError(err, res);
  }
});

// GET /api/courses - Lister les cours
router.get('/', async (req, res) => {
  try {
    const { instructor_id, page, page_size } = req.query;
    const response = await coursesClient.listCourses({
      instructor_id_filter: instructor_id || '',
      page: page ? Number(page) : 1,
      page_size: page_size ? Number(page_size) : 20,
    });
    res.json(response);
  } catch (err) {
    handleGrpcError(err, res);
  }
});

// PUT /api/courses/:id - Mettre a jour un cours
router.put('/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    const response = await coursesClient.updateCourse({ id: req.params.id, title, description });
    res.json(response);
  } catch (err) {
    handleGrpcError(err, res);
  }
});

// DELETE /api/courses/:id - Supprimer un cours
router.delete('/:id', async (req, res) => {
  try {
    const response = await coursesClient.deleteCourse({ id: req.params.id });
    res.json(response);
  } catch (err) {
    handleGrpcError(err, res);
  }
});

// POST /api/courses/:id/lessons - Ajouter une lecon a un cours
router.post('/:id/lessons', async (req, res) => {
  try {
    const { title, content_url, duration_minutes } = req.body;
    const response = await coursesClient.addLesson({
      course_id: req.params.id,
      title,
      content_url,
      duration_minutes,
    });
    res.status(201).json(response);
  } catch (err) {
    handleGrpcError(err, res);
  }
});

module.exports = router;
