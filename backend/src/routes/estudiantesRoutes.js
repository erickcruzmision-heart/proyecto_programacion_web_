const express = require('express');
const router = express.Router();

const estudiantesController = require('../controllers/estudiantesController');

router.get('/', estudiantesController.obtenerEstudiantes);
router.post('/', estudiantesController.crearEstudiante);

module.exports = router;