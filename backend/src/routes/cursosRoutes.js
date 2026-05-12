const express = require('express');
const router = express.Router();

const cursosController = require('../controllers/cursosController');

router.get('/', cursosController.obtenerCursos);
router.post('/', cursosController.crearCurso);

module.exports = router;