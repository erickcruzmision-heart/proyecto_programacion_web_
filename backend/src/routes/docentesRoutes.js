const express = require('express');
const router = express.Router();

const docentesController = require('../controllers/docentesController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { validarRol } = require('../middlewares/rolMiddleware');

router.get('/', verificarToken, docentesController.obtenerDocentes);

router.post(
    '/',
    verificarToken,
    validarRol('Administrador'),
    docentesController.crearDocente
);

router.put(
    '/:id',
    verificarToken,
    validarRol('Administrador'),
    docentesController.actualizarDocente
);

router.put(
    '/desactivar/:id',
    verificarToken,
    validarRol('Administrador'),
    docentesController.desactivarDocente
);

module.exports = router;