const express = require('express');
const router = express.Router();

const inscripcionesController = require('../controllers/inscripcionesController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, inscripcionesController.obtenerInscripciones);

router.get(
    '/estudiante/:id_estudiante',
    verificarToken,
    inscripcionesController.obtenerInscripcionesPorEstudiante
);

router.get(
    '/horario/:id_estudiante',
    verificarToken,
    inscripcionesController.obtenerHorarioEstudiante
);

router.post('/', verificarToken, inscripcionesController.crearInscripcion);

router.put(
    '/cancelar/:id',
    verificarToken,
    inscripcionesController.cancelarInscripcion
);

module.exports = router;