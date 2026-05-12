const pool = require('../config/db');

const obtenerInscripciones = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                i.id_inscripcion,
                i.id_estudiante,
                e.nombre || ' ' || e.apellido AS estudiante,
                i.id_grupo,
                c.nombre AS curso,
                g.codigo AS grupo,
                g.dia,
                g.hora_inicio,
                g.hora_final,
                i.fecha_inscripcion,
                i.estado
            FROM inscripcion i
            INNER JOIN estudiante e ON e.id_estudiante = i.id_estudiante
            INNER JOIN grupo g ON g.id_grupo = i.id_grupo
            INNER JOIN curso c ON c.id_curso = g.id_curso
            ORDER BY i.id_inscripcion
        `);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Error al obtener inscripciones:', error);

        res.status(500).json({
            success: false,
            message: 'Error al obtener inscripciones',
            error: error.message
        });
    }
};

const crearInscripcion = async (req, res) => {
    try {
        const { id_estudiante, id_grupo } = req.body;

        if (!id_estudiante || !id_grupo) {
            return res.status(400).json({
                success: false,
                message: 'El estudiante y el grupo son obligatorios'
            });
        }

        const result = await pool.query(`
            INSERT INTO inscripcion (id_estudiante, id_grupo, estado)
            VALUES ($1, $2, TRUE)
            RETURNING *
        `, [id_estudiante, id_grupo]);

        res.status(201).json({
            success: true,
            message: 'Inscripción registrada correctamente',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error al crear inscripción:', error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const cancelarInscripcion = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            UPDATE inscripcion
            SET estado = FALSE
            WHERE id_inscripcion = $1
              AND estado = TRUE
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró una inscripción activa para cancelar'
            });
        }

        res.json({
            success: true,
            message: 'Inscripción cancelada correctamente',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error al cancelar inscripción:', error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    obtenerInscripciones,
    crearInscripcion,
    cancelarInscripcion
};