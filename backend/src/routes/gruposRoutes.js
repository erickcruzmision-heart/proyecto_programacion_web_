const express = require('express');
const router = express.Router();

const gruposController = require('../controllers/gruposController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { validarRol } = require('../middlewares/rolMiddleware');

router.get('/', verificarToken, gruposController.obtenerGrupos);

router.get('/disponibles', verificarToken, gruposController.obtenerGruposDisponibles);

router.post(
    '/',
    verificarToken,
    validarRol('Administrador'),
    gruposController.crearGrupo
);

router.put(
    '/:id',
    verificarToken,
    validarRol('Administrador'),
    gruposController.actualizarGrupo
);

router.put(
    '/desactivar/:id',
    verificarToken,
    validarRol('Administrador'),
    gruposController.desactivarGrupo
);

module.exports = router;