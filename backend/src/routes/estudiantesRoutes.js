const express = require('express');
const router = express.Router();

const estudiantesController = require('../controllers/estudiantesController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { validarRol } = require('../middlewares/rolMiddleware');

// IMPORTANTE:
// Esta ruta debe ir antes de '/:id'
router.get(
    '/usuario/:id_usuario',
    verificarToken,
    estudiantesController.obtenerEstudiantePorUsuario
);

// Obtener todos los estudiantes
router.get(
    '/',
    verificarToken,
    validarRol('Administrador'),
    estudiantesController.obtenerEstudiantes
);

// Obtener un estudiante por ID
router.get(
    '/:id',
    verificarToken,
    estudiantesController.obtenerEstudiantePorId
);

// Crear estudiante
router.post(
    '/',
    verificarToken,
    validarRol('Administrador'),
    estudiantesController.crearEstudiante
);

// Actualizar estudiante
router.put(
    '/:id',
    verificarToken,
    validarRol('Administrador'),
    estudiantesController.actualizarEstudiante
);

// Desactivar estudiante
router.put(
    '/desactivar/:id',
    verificarToken,
    validarRol('Administrador'),
    estudiantesController.desactivarEstudiante
);

module.exports = router;