    const express = require('express');
    const router = express.Router();

    const inscripcionesController = require('../controllers/inscripcionesController');

    router.get('/', inscripcionesController.obtenerInscripciones);
    router.post('/', inscripcionesController.crearInscripcion);
    router.put('/cancelar/:id', inscripcionesController.cancelarInscripcion);

    module.exports = router;