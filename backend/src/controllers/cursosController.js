const pool = require('../config/db');

const obtenerCursos = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id_curso,
                codigo_materia,
                nombre,
                descripcion,
                estado
            FROM curso
            ORDER BY id_curso
        `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener cursos:', error);

        res.status(500).json({
            success: false,
            message: 'Error al obtener cursos',
            error: error.message
        });
    }
};

const crearCurso = async (req, res) => {
    try {
        const { codigo_materia, nombre, descripcion, estado } = req.body;

        if (!codigo_materia || !nombre) {
            return res.status(400).json({
                success: false,
                message: 'El código y nombre del curso son obligatorios'
            });
        }

        const result = await pool.query(`
            INSERT INTO curso (codigo_materia, nombre, descripcion, estado)
            VALUES ($1, $2, $3, COALESCE($4, TRUE))
            RETURNING *
        `, [codigo_materia, nombre, descripcion || null, estado]);

        res.status(201).json({
            success: true,
            message: 'Curso creado correctamente',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear curso:', error);

        res.status(500).json({
            success: false,
            message: 'Error al crear curso',
            error: error.message
        });
    }
};

module.exports = {
    obtenerCursos,
    crearCurso
};