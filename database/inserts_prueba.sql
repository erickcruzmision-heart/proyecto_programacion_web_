-- ============================================
-- PASO 6: DATOS DE PRUEBA CONTROLADOS
-- PostgreSQL - ClassMatch
-- ============================================

-- Limpiar datos de prueba, respetando dependencias
TRUNCATE TABLE inscripcion RESTART IDENTITY CASCADE;
TRUNCATE TABLE grupo RESTART IDENTITY CASCADE;
TRUNCATE TABLE curso RESTART IDENTITY CASCADE;
TRUNCATE TABLE docente RESTART IDENTITY CASCADE;
TRUNCATE TABLE estudiante RESTART IDENTITY CASCADE;
TRUNCATE TABLE usuario RESTART IDENTITY CASCADE;
TRUNCATE TABLE rol RESTART IDENTITY CASCADE;

-- Insertar roles
INSERT INTO rol (nom_rol, descripcion)
VALUES
('Administrador', 'Usuario encargado de administrar el sistema'),
('Estudiante', 'Usuario que puede inscribirse en materias');

-- Insertar usuarios
INSERT INTO usuario (nombre_usuario, correo, password, id_rol, estado)
VALUES
('admin', 'admin@classmatch.com', '123456', 1, TRUE),
('juanperez', 'juan@classmatch.com', '123456', 2, TRUE),
('mariagarcia', 'maria@classmatch.com', '123456', 2, TRUE),
('carloslopez', 'carlos@classmatch.com', '123456', 2, FALSE);

-- Insertar estudiantes
INSERT INTO estudiante (id_usuario, nombre, apellido, correo, dui, telefono, estado)
VALUES
(2, 'Juan', 'Pérez', 'juan@classmatch.com', '00000001-1', '7000-0001', TRUE),
(3, 'María', 'García', 'maria@classmatch.com', '00000002-2', '7000-0002', TRUE),
(4, 'Carlos', 'López', 'carlos@classmatch.com', '00000003-3', '7000-0003', FALSE);

-- Insertar docentes
INSERT INTO docente (nombre, apellido, correo, telefono, especialidad, estado)
VALUES
('Ana', 'Martínez', 'ana@classmatch.com', '7100-0001', 'Programación', TRUE),
('Roberto', 'Hernández', 'roberto@classmatch.com', '7100-0002', 'Base de Datos', TRUE),
('Luis', 'Ramírez', 'luis@classmatch.com', '7100-0003', 'Matemática', FALSE);

-- Insertar cursos
INSERT INTO curso (codigo_materia, nombre, descripcion, estado)
VALUES
('PW-I', 'Programación Web I', 'Curso de desarrollo web básico', TRUE),
('BD-I', 'Base de Datos I', 'Curso de bases de datos relacionales', TRUE),
('MAT-I', 'Matemática I', 'Curso de matemática general', TRUE),
('RED-I', 'Redes I', 'Curso de redes informáticas', FALSE);

-- Insertar grupos
INSERT INTO grupo (
    codigo, id_curso, id_docente, cupo_maximo, cupo_disponible,
    modalidad, aula, dia, hora_inicio, hora_final, estado
)
VALUES
-- Grupo 1: Programación Web I, lunes 08:00 - 10:00
('G1', 1, 1, 2, 2, 'Presencial', 'Aula 101', 'Lunes', '08:00', '10:00', TRUE),

-- Grupo 2: Programación Web I, martes 10:00 - 12:00
-- Sirve para probar misma materia en otro grupo
('G2', 1, 1, 2, 2, 'Presencial', 'Aula 102', 'Martes', '10:00', '12:00', TRUE),

-- Grupo 3: Base de Datos I, lunes 09:00 - 11:00
-- Sirve para probar choque de horario con Programación Web G1
('G1', 2, 2, 2, 2, 'Presencial', 'Lab 1', 'Lunes', '09:00', '11:00', TRUE),

-- Grupo 4: Matemática I, miércoles 08:00 - 10:00
-- Cupo de 1 para probar cupo lleno
('G1', 3, 2, 1, 1, 'Virtual', 'Meet', 'Miércoles', '08:00', '10:00', TRUE),

-- Grupo 5: Redes I, jueves 08:00 - 10:00
-- Curso inactivo
('G1', 4, 2, 2, 2, 'Presencial', 'Aula 103', 'Jueves', '08:00', '10:00', TRUE),

-- Grupo 6: Base de Datos I, viernes 13:00 - 15:00
-- Docente inactivo
('G2', 2, 3, 2, 2, 'Presencial', 'Lab 2', 'Viernes', '13:00', '15:00', TRUE),

-- Grupo 7: Matemática I, sábado 08:00 - 10:00
-- Grupo inactivo
('G2', 3, 2, 2, 2, 'Presencial', 'Aula 104', 'Sábado', '08:00', '10:00', FALSE);