const pool = require('../config/db');

const obtenerGrupos = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                g.id_grupo,
                g.codigo,
                g.id_curso,
                c.nombre AS curso,
                g.id_docente,
                d.nombre || ' ' || d.apellido AS docente,
                g.cupo_maximo,
                g.cupo_disponible,
                g.modalidad,
                g.aula,
                g.dia,
                g.hora_inicio,
                g.hora_final,
                g.estado
            FROM grupo g
            INNER JOIN curso c ON c.id_curso = g.id_curso
            INNER JOIN docente d ON d.id_docente = g.id_docente
            ORDER BY g.id_grupo
        `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener grupos:', error);

        res.status(500).json({
            success: false,
            message: 'Error al obtener grupos',
            error: error.message
        });
    }
};

const crearGrupo = async (req, res) => {
    try {
        const {
            codigo,
            id_curso,
            id_docente,
            cupo_maximo,
            modalidad,
            aula,
            dia,
            hora_inicio,
            hora_final,
            estado
        } = req.body;

        if (!codigo || !id_curso || !id_docente || !cupo_maximo || !modalidad || !dia || !hora_inicio || !hora_final) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos obligatorios para crear el grupo'
            });
        }

        const result = await pool.query(`
            INSERT INTO grupo (
                codigo,
                id_curso,
                id_docente,
                cupo_maximo,
                cupo_disponible,
                modalidad,
                aula,
                dia,
                hora_inicio,
                hora_final,
                estado
            )
            VALUES ($1, $2, $3, $4, $4, $5, $6, $7, $8, $9, COALESCE($10, TRUE))
            RETURNING *
        `, [
            codigo,
            id_curso,
            id_docente,
            cupo_maximo,
            modalidad,
            aula || null,
            dia,
            hora_inicio,
            hora_final,
            estado
        ]);

        res.status(201).json({
            success: true,
            message: 'Grupo creado correctamente',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error al crear grupo:', error);

        res.status(500).json({
            success: false,
            message: 'Error al crear grupo',
            error: error.message
        });
    }
};

module.exports = {
    obtenerGrupos,
    crearGrupo
};