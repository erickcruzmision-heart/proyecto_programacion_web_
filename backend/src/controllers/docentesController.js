const pool = require('../config/db');

const obtenerDocentes = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id_docente,
                nombre,
                apellido,
                correo,
                telefono,
                especialidad,
                estado
            FROM docente
            ORDER BY id_docente
        `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener docentes:', error);

        res.status(500).json({
            success: false,
            message: 'Error al obtener docentes',
            error: error.message
        });
    }
};

const crearDocente = async (req, res) => {
    try {
        const { nombre, apellido, correo, telefono, especialidad, estado } = req.body;

        if (!nombre || !apellido || !correo) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, apellido y correo son obligatorios'
            });
        }

        const result = await pool.query(`
            INSERT INTO docente (nombre, apellido, correo, telefono, especialidad, estado)
            VALUES ($1, $2, $3, $4, $5, COALESCE($6, TRUE))
            RETURNING *
        `, [
            nombre,
            apellido,
            correo,
            telefono || null,
            especialidad || null,
            estado
        ]);

        res.status(201).json({
            success: true,
            message: 'Docente creado correctamente',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear docente:', error);

        res.status(500).json({
            success: false,
            message: 'Error al crear docente',
            error: error.message
        });
    }
};

module.exports = {
    obtenerDocentes,
    crearDocente
};