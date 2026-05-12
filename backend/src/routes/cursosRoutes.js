const express = require('express');
const router = express.Router();

const cursosController = require('../controllers/cursosController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { validarRol } = require('../middlewares/rolMiddleware');

router.get('/', verificarToken, cursosController.obtenerCursos);

router.post(
    '/',
    verificarToken,
    validarRol('Administrador'),
    cursosController.crearCurso
);

router.put(
    '/:id',
    verificarToken,
    validarRol('Administrador'),
    cursosController.actualizarCurso
);

router.put(
    '/desactivar/:id',
    verificarToken,
    validarRol('Administrador'),
    cursosController.desactivarCurso
);

module.exports = router;