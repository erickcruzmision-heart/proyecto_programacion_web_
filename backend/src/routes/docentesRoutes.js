const express = require('express');
const router = express.Router();

const docentesController = require('../controllers/docentesController');

router.get('/', docentesController.obtenerDocentes);
router.post('/', docentesController.crearDocente);

module.exports = router;