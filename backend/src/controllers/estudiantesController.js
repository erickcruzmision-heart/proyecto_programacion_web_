const pool = require('../config/db');

const obtenerEstudiantes = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                e.id_estudiante,
                e.id_usuario,
                e.nombre,
                e.apellido,
                e.correo,
                e.dui,
                e.telefono,
                e.estado,
                u.nombre_usuario
            FROM estudiante e
            INNER JOIN usuario u ON u.id_usuario = e.id_usuario
            ORDER BY e.id_estudiante
        `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener estudiantes:', error);

        res.status(500).json({
            success: false,
            message: 'Error al obtener estudiantes',
            error: error.message
        });
    }
};

const crearEstudiante = async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            nombre_usuario,
            password,
            nombre,
            apellido,
            correo,
            dui,
            telefono,
            estado
        } = req.body;

        if (!nombre_usuario || !password || !nombre || !apellido || !correo) {
            return res.status(400).json({
                success: false,
                message: 'Nombre de usuario, contraseña, nombre, apellido y correo son obligatorios'
            });
        }

        await client.query('BEGIN');

        const rolResult = await client.query(`
            SELECT id_rol 
            FROM rol 
            WHERE nom_rol = 'Estudiante'
        `);

        if (rolResult.rows.length === 0) {
            throw new Error('No existe el rol Estudiante en la base de datos');
        }

        const idRolEstudiante = rolResult.rows[0].id_rol;

        const usuarioResult = await client.query(`
            INSERT INTO usuario (nombre_usuario, correo, password, id_rol, estado)
            VALUES ($1, $2, $3, $4, COALESCE($5, TRUE))
            RETURNING id_usuario, nombre_usuario, correo, estado
        `, [
            nombre_usuario,
            correo,
            password,
            idRolEstudiante,
            estado
        ]);

        const idUsuario = usuarioResult.rows[0].id_usuario;

        const estudianteResult = await client.query(`
            INSERT INTO estudiante (id_usuario, nombre, apellido, correo, dui, telefono, estado)
            VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, TRUE))
            RETURNING *
        `, [
            idUsuario,
            nombre,
            apellido,
            correo,
            dui || null,
            telefono || null,
            estado
        ]);

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Estudiante creado correctamente',
            data: {
                usuario: usuarioResult.rows[0],
                estudiante: estudianteResult.rows[0]
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');

        console.error('Error al crear estudiante:', error);

        res.status(500).json({
            success: false,
            message: 'Error al crear estudiante',
            error: error.message
        });
    } finally {
        client.release();
    }
};

const obtenerEstudiantePorId = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT 
                e.id_estudiante,
                e.id_usuario,
                e.nombre,
                e.apellido,
                e.correo,
                e.dui,
                e.telefono,
                e.estado,
                u.nombre_usuario,
                r.nom_rol
            FROM estudiante e
            INNER JOIN usuario u ON u.id_usuario = e.id_usuario
            INNER JOIN rol r ON r.id_rol = u.id_rol
            WHERE e.id_estudiante = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error al obtener estudiante:', error);

        res.status(500).json({
            success: false,
            message: 'Error al obtener estudiante',
            error: error.message
        });
    }
};

const obtenerEstudiantePorUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params;

        const result = await pool.query(`
            SELECT 
                e.id_estudiante,
                e.id_usuario,
                e.nombre,
                e.apellido,
                e.correo,
                e.dui,
                e.telefono,
                e.estado,
                u.nombre_usuario,
                r.nom_rol
            FROM estudiante e
            INNER JOIN usuario u ON u.id_usuario = e.id_usuario
            INNER JOIN rol r ON r.id_rol = u.id_rol
            WHERE e.id_usuario = $1
        `, [id_usuario]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró estudiante asociado a este usuario'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error al obtener estudiante por usuario:', error);

        res.status(500).json({
            success: false,
            message: 'Error al obtener estudiante por usuario',
            error: error.message
        });
    }
};

const actualizarEstudiante = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        const {
            nombre_usuario,
            nombre,
            apellido,
            correo,
            dui,
            telefono,
            estado
        } = req.body;

        if (!nombre_usuario || !nombre || !apellido || !correo) {
            return res.status(400).json({
                success: false,
                message: 'Nombre de usuario, nombre, apellido y correo son obligatorios'
            });
        }

        await client.query('BEGIN');

        const estudianteActual = await client.query(`
            SELECT id_usuario
            FROM estudiante
            WHERE id_estudiante = $1
        `, [id]);

        if (estudianteActual.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        const idUsuario = estudianteActual.rows[0].id_usuario;

        const usuarioResult = await client.query(`
            UPDATE usuario
            SET 
                nombre_usuario = $1,
                correo = $2,
                estado = COALESCE($3, estado)
            WHERE id_usuario = $4
            RETURNING id_usuario, nombre_usuario, correo, estado
        `, [
            nombre_usuario,
            correo,
            estado,
            idUsuario
        ]);

        const estudianteResult = await client.query(`
            UPDATE estudiante
            SET
                nombre = $1,
                apellido = $2,
                correo = $3,
                dui = $4,
                telefono = $5,
                estado = COALESCE($6, estado)
            WHERE id_estudiante = $7
            RETURNING *
        `, [
            nombre,
            apellido,
            correo,
            dui || null,
            telefono || null,
            estado,
            id
        ]);

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Estudiante actualizado correctamente',
            data: {
                usuario: usuarioResult.rows[0],
                estudiante: estudianteResult.rows[0]
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');

        console.error('Error al actualizar estudiante:', error);

        res.status(400).json({
            success: false,
            message: 'Error al actualizar estudiante',
            error: error.message
        });
    } finally {
        client.release();
    }
};

const desactivarEstudiante = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        await client.query('BEGIN');

        const estudianteActual = await client.query(`
            SELECT id_usuario
            FROM estudiante
            WHERE id_estudiante = $1
        `, [id]);

        if (estudianteActual.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        const idUsuario = estudianteActual.rows[0].id_usuario;

        const estudianteResult = await client.query(`
            UPDATE estudiante
            SET estado = FALSE
            WHERE id_estudiante = $1
            RETURNING *
        `, [id]);

        const usuarioResult = await client.query(`
            UPDATE usuario
            SET estado = FALSE
            WHERE id_usuario = $1
            RETURNING id_usuario, nombre_usuario, correo, estado
        `, [idUsuario]);

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Estudiante desactivado correctamente',
            data: {
                usuario: usuarioResult.rows[0],
                estudiante: estudianteResult.rows[0]
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');

        console.error('Error al desactivar estudiante:', error);

        res.status(400).json({
            success: false,
            message: 'Error al desactivar estudiante',
            error: error.message
        });
    } finally {
        client.release();
    }
};

module.exports = {
    obtenerEstudiantes,
    obtenerEstudiantePorId,
    obtenerEstudiantePorUsuario,
    crearEstudiante,
    actualizarEstudiante,
    desactivarEstudiante
};