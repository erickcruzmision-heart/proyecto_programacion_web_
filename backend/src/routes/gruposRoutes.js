const express = require('express');
const router = express.Router();

const gruposController = require('../controllers/gruposController');

router.get('/', gruposController.obtenerGrupos);
router.post('/', gruposController.crearGrupo);

module.exports = router;