const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({
                success: false,
                message: 'Correo y contraseña son obligatorios'
            });
        }

        const result = await pool.query(`
            SELECT 
                u.id_usuario,
                u.nombre_usuario,
                u.correo,
                u.password,
                u.estado,
                r.nom_rol
            FROM usuario u
            INNER JOIN rol r ON r.id_rol = u.id_rol
            WHERE LOWER(u.correo) = LOWER($1)
        `, [correo]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        const usuario = result.rows[0];

        if (!usuario.estado) {
            return res.status(403).json({
                success: false,
                message: 'El usuario se encuentra inactivo'
            });
        }

        let passwordValida = false;

        if (usuario.password.startsWith('$2a$') || usuario.password.startsWith('$2b$')) {
            passwordValida = await bcrypt.compare(password, usuario.password);
        } else {
            passwordValida = password === usuario.password;
        }

        if (!passwordValida) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                correo: usuario.correo,
                rol: usuario.nom_rol
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
        );

        res.json({
            success: true,
            message: 'Inicio de sesión correcto',
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre_usuario: usuario.nombre_usuario,
                correo: usuario.correo,
                rol: usuario.nom_rol
            }
        });

    } catch (error) {
        console.error('Error en login:', error);

        res.status(500).json({
            success: false,
            message: 'Error interno al iniciar sesión',
            error: error.message
        });
    }
};

module.exports = {
    login
};