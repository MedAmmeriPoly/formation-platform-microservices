const express = require('express');
const usersClient = require('../usersClient');

const router = express.Router();

// Convertit les erreurs gRPC en codes HTTP appropries
function handleGrpcError(err, res) {
  const grpcToHttp = { 3: 400, 5: 404, 6: 409 }; // INVALID_ARGUMENT, NOT_FOUND, ALREADY_EXISTS
  const status = grpcToHttp[err.code] || 500;
  res.status(status).json({ success: false, message: err.message || 'Erreur interne' });
}

// POST /api/users - Creer un utilisateur
router.post('/', async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;
    const response = await usersClient.createUser({ full_name, email, password, role: role || 0 });
    res.status(201).json(response);
  } catch (err) {
    handleGrpcError(err, res);
  }
});

// GET /api/users/:id - Recuperer un utilisateur
router.get('/:id', async (req, res) => {
  try {
    const response = await usersClient.getUser({ id: req.params.id });
    res.json(response);
  } catch (err) {
    handleGrpcError(err, res);
  }
});

// GET /api/users - Lister les utilisateurs (avec pagination et filtre optionnel par role)
router.get('/', async (req, res) => {
  try {
    const { role_filter, page, page_size } = req.query;
    const request = {
      page: page ? Number(page) : 1,
      page_size: page_size ? Number(page_size) : 20,
    };
    // role_filter est optionnel : on ne l'envoie que s'il est explicitement fourni
    if (role_filter !== undefined) {
      request.role_filter = Number(role_filter);
      request.has_role_filter = true;
    }
    const response = await usersClient.listUsers(request);
    res.json(response);
  } catch (err) {
    handleGrpcError(err, res);
  }
});

// PUT /api/users/:id - Mettre a jour un utilisateur
router.put('/:id', async (req, res) => {
  try {
    const { full_name, email } = req.body;
    const response = await usersClient.updateUser({ id: req.params.id, full_name, email });
    res.json(response);
  } catch (err) {
    handleGrpcError(err, res);
  }
});

// DELETE /api/users/:id - Supprimer un utilisateur
router.delete('/:id', async (req, res) => {
  try {
    const response = await usersClient.deleteUser({ id: req.params.id });
    res.json(response);
  } catch (err) {
    handleGrpcError(err, res);
  }
});

module.exports = router;
