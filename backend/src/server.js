const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const cursosRoutes = require('./routes/cursosRoutes');
const docentesRoutes = require('./routes/docentesRoutes');
const estudiantesRoutes = require('./routes/estudiantesRoutes');
const gruposRoutes = require('./routes/gruposRoutes');
const inscripcionesRoutes = require('./routes/inscripcionesRoutes');

// console.log('authRoutes:', typeof authRoutes);
// console.log('cursosRoutes:', typeof cursosRoutes);
// console.log('docentesRoutes:', typeof docentesRoutes);
// console.log('estudiantesRoutes:', typeof estudiantesRoutes);
// console.log('gruposRoutes:', typeof gruposRoutes);
// console.log('inscripcionesRoutes:', typeof inscripcionesRoutes);

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API ClassMatch funcionando correctamente'
    });
});

app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() AS fecha_servidor');

        res.json({
            success: true,
            message: 'Conexión a PostgreSQL correcta',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error en test-db:', error);

        res.status(500).json({
            success: false,
            message: 'Error al conectar con PostgreSQL',
            error: error.message
        });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/docentes', docentesRoutes);
app.use('/api/estudiantes', estudiantesRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Servidor ClassMatch ejecutándose en puerto ${PORT}`);
});