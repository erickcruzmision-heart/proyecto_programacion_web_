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

const actualizarDocente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, correo, telefono, especialidad, estado } = req.body;

        if (!nombre || !apellido || !correo) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, apellido y correo son obligatorios'
            });
        }

        const result = await pool.query(`
            UPDATE docente
            SET 
                nombre = $1,
                apellido = $2,
                correo = $3,
                telefono = $4,
                especialidad = $5,
                estado = COALESCE($6, estado)
            WHERE id_docente = $7
            RETURNING *
        `, [
            nombre,
            apellido,
            correo,
            telefono || null,
            especialidad || null,
            estado,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Docente no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Docente actualizado correctamente',
            data: result.rows[0]
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar docente',
            error: error.message
        });
    }
};

const desactivarDocente = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            UPDATE docente
            SET estado = FALSE
            WHERE id_docente = $1
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Docente no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Docente desactivado correctamente',
            data: result.rows[0]
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al desactivar docente',
            error: error.message
        });
    }
};

module.exports = {
    obtenerDocentes,
    crearDocente,
    actualizarDocente,
    desactivarDocente
};