-- ============================================
-- SCRIPT BASE DE DATOS CLASSMATCH
-- PostgreSQL
-- ============================================

-- Opcional: eliminar tablas si ya existen
DROP TABLE IF EXISTS inscripcion CASCADE;
DROP TABLE IF EXISTS grupo CASCADE;
DROP TABLE IF EXISTS curso CASCADE;
DROP TABLE IF EXISTS docente CASCADE;
DROP TABLE IF EXISTS estudiante CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;
DROP TABLE IF EXISTS rol CASCADE;

-- ============================================
-- TABLA: ROL
-- ============================================
CREATE TABLE rol (
    id_rol SERIAL PRIMARY KEY,
    nom_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(150)
);

-- ============================================
-- TABLA: USUARIO
-- ============================================
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (id_rol)
        REFERENCES rol(id_rol)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ============================================
-- TABLA: ESTUDIANTE
-- ============================================
CREATE TABLE estudiante (
    id_estudiante SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    dui VARCHAR(20) UNIQUE,
    telefono VARCHAR(20),
    estado BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_estudiante_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ============================================
-- TABLA: DOCENTE
-- ============================================
CREATE TABLE docente (
    id_docente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    especialidad VARCHAR(100),
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================
-- TABLA: CURSO
-- ============================================
CREATE TABLE curso (
    id_curso SERIAL PRIMARY KEY,
    codigo_materia VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(200),
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================
-- TABLA: GRUPO
-- ============================================
CREATE TABLE grupo (
    id_grupo SERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL,
    id_curso INT NOT NULL,
    id_docente INT NOT NULL,
    cupo_maximo INT NOT NULL,
    cupo_disponible INT NOT NULL,
    modalidad VARCHAR(50) NOT NULL,
    aula VARCHAR(50),
    dia VARCHAR(20) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_final TIME NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_grupo_curso
        FOREIGN KEY (id_curso)
        REFERENCES curso(id_curso)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_grupo_docente
        FOREIGN KEY (id_docente)
        REFERENCES docente(id_docente)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_grupo_codigo_curso
        UNIQUE (codigo, id_curso),

    CONSTRAINT chk_cupo_maximo
        CHECK (cupo_maximo > 0),

    CONSTRAINT chk_cupo_disponible
        CHECK (cupo_disponible >= 0 AND cupo_disponible <= cupo_maximo),

    CONSTRAINT chk_horario_grupo
        CHECK (hora_inicio < hora_final),

    CONSTRAINT chk_dia_grupo
        CHECK (dia IN (
            'Lunes',
            'Martes',
            'Miercoles',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sabado',
            'Sábado',
            'Domingo'
        ))
);

-- ============================================
-- TABLA: INSCRIPCION
-- ============================================
CREATE TABLE inscripcion (
    id_inscripcion SERIAL PRIMARY KEY,
    id_estudiante INT NOT NULL,
    id_grupo INT NOT NULL,
    fecha_inscripcion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_inscripcion_estudiante
        FOREIGN KEY (id_estudiante)
        REFERENCES estudiante(id_estudiante)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_inscripcion_grupo
        FOREIGN KEY (id_grupo)
        REFERENCES grupo(id_grupo)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_estudiante_grupo
        UNIQUE (id_estudiante, id_grupo)
);

-- ============================================
-- DATOS BASE
-- ============================================

INSERT INTO rol (nom_rol, descripcion)
VALUES 
('Administrador', 'Usuario encargado de administrar cursos, docentes, grupos y estudiantes'),
('Estudiante', 'Usuario que puede consultar grupos e inscribirse en materias');

-- ============================================
-- CONSULTAS DE APOYO
-- ============================================

-- Ver usuarios con su rol
SELECT 
    u.id_usuario,
    u.nombre_usuario,
    u.correo,
    r.nom_rol,
    u.estado
FROM usuario u
INNER JOIN rol r ON u.id_rol = r.id_rol;

-- Ver grupos con curso y docente
SELECT 
    g.id_grupo,
    g.codigo AS grupo,
    c.nombre AS curso,
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
INNER JOIN curso c ON g.id_curso = c.id_curso
INNER JOIN docente d ON g.id_docente = d.id_docente;

-- Ver inscripciones de estudiantes
SELECT 
    i.id_inscripcion,
    e.nombre || ' ' || e.apellido AS estudiante,
    c.nombre AS curso,
    g.codigo AS grupo,
    g.dia,
    g.hora_inicio,
    g.hora_final,
    i.fecha_inscripcion,
    i.estado
FROM inscripcion i
INNER JOIN estudiante e ON i.id_estudiante = e.id_estudiante
INNER JOIN grupo g ON i.id_grupo = g.id_grupo
INNER JOIN curso c ON g.id_curso = c.id_curso;

-------------------------------------------------------------------------------------

-- ============================================
-- PASO 1: AJUSTES INICIALES DE VALIDACIÓN
-- PostgreSQL - ClassMatch
-- ============================================

-- 1. Quitar el UNIQUE normal de inscripción si existe
ALTER TABLE inscripcion
DROP CONSTRAINT IF EXISTS uq_estudiante_grupo;

-- 2. Evitar que un estudiante tenga dos inscripciones activas al mismo grupo
CREATE UNIQUE INDEX IF NOT EXISTS uq_inscripcion_activa_estudiante_grupo
ON inscripcion (id_estudiante, id_grupo)
WHERE estado = TRUE;

-- 3. Evitar correos duplicados sin importar mayúsculas o minúsculas en usuario
CREATE UNIQUE INDEX IF NOT EXISTS uq_usuario_correo_lower
ON usuario (LOWER(correo));

-- 4. Evitar correos duplicados sin importar mayúsculas o minúsculas en estudiante
CREATE UNIQUE INDEX IF NOT EXISTS uq_estudiante_correo_lower
ON estudiante (LOWER(correo));

-- 5. Evitar correos duplicados sin importar mayúsculas o minúsculas en docente
CREATE UNIQUE INDEX IF NOT EXISTS uq_docente_correo_lower
ON docente (LOWER(correo));

-- 6. Validar que cupo disponible no sea negativo ni mayor al cupo máximo
ALTER TABLE grupo
DROP CONSTRAINT IF EXISTS chk_cupo_disponible;

ALTER TABLE grupo
ADD CONSTRAINT chk_cupo_disponible
CHECK (cupo_disponible >= 0 AND cupo_disponible <= cupo_maximo);

-- 7. Validar que la hora inicial sea menor que la hora final
ALTER TABLE grupo
DROP CONSTRAINT IF EXISTS chk_horario_grupo;

ALTER TABLE grupo
ADD CONSTRAINT chk_horario_grupo
CHECK (hora_inicio < hora_final);

-- 8. Validar que el cupo máximo sea mayor que cero
ALTER TABLE grupo
DROP CONSTRAINT IF EXISTS chk_cupo_maximo;

ALTER TABLE grupo
ADD CONSTRAINT chk_cupo_maximo
CHECK (cupo_maximo > 0);

-- ============================================
-- PASO 2: FUNCIÓN DE VALIDACIÓN DE INSCRIPCIÓN
-- PostgreSQL - ClassMatch
-- ============================================

CREATE OR REPLACE FUNCTION fn_validar_inscripcion()
RETURNS TRIGGER AS $$
DECLARE
    v_estudiante_activo BOOLEAN;
    v_grupo RECORD;
    v_existe_misma_materia INT;
    v_existe_choque_horario INT;
BEGIN
    -- Solo validar cuando la inscripción quede activa
    IF NEW.estado = TRUE THEN

        -- 1. Validar estudiante activo
        SELECT e.estado
        INTO v_estudiante_activo
        FROM estudiante e
        WHERE e.id_estudiante = NEW.id_estudiante;

        IF v_estudiante_activo IS NULL THEN
            RAISE EXCEPTION 'El estudiante no existe.';
        END IF;

        IF v_estudiante_activo = FALSE THEN
            RAISE EXCEPTION 'El estudiante se encuentra inactivo y no puede inscribirse.';
        END IF;

        -- 2. Obtener datos del grupo, curso y docente
        SELECT 
            g.id_grupo,
            g.id_curso,
            g.id_docente,
            g.codigo,
            g.dia,
            g.hora_inicio,
            g.hora_final,
            g.cupo_disponible,
            g.estado AS grupo_activo,
            c.estado AS curso_activo,
            d.estado AS docente_activo
        INTO v_grupo
        FROM grupo g
        INNER JOIN curso c ON c.id_curso = g.id_curso
        INNER JOIN docente d ON d.id_docente = g.id_docente
        WHERE g.id_grupo = NEW.id_grupo
        FOR UPDATE OF g;

        IF v_grupo.id_grupo IS NULL THEN
            RAISE EXCEPTION 'El grupo seleccionado no existe.';
        END IF;

        -- 3. Validar grupo activo
        IF v_grupo.grupo_activo = FALSE THEN
            RAISE EXCEPTION 'El grupo seleccionado se encuentra inactivo.';
        END IF;

        -- 4. Validar curso activo
        IF v_grupo.curso_activo = FALSE THEN
            RAISE EXCEPTION 'El curso asociado al grupo se encuentra inactivo.';
        END IF;

        -- 5. Validar docente activo
        IF v_grupo.docente_activo = FALSE THEN
            RAISE EXCEPTION 'El docente asignado al grupo se encuentra inactivo.';
        END IF;

        -- 6. Validar cupo disponible
        IF v_grupo.cupo_disponible <= 0 THEN
            RAISE EXCEPTION 'El grupo seleccionado ya no tiene cupos disponibles.';
        END IF;

        -- 7. Validar que no inscriba la misma materia en otro grupo
        SELECT COUNT(*)
        INTO v_existe_misma_materia
        FROM inscripcion i
        INNER JOIN grupo g_existente ON g_existente.id_grupo = i.id_grupo
        WHERE i.id_estudiante = NEW.id_estudiante
          AND i.estado = TRUE
          AND g_existente.id_curso = v_grupo.id_curso
          AND i.id_inscripcion <> COALESCE(NEW.id_inscripcion, -1);

        IF v_existe_misma_materia > 0 THEN
            RAISE EXCEPTION 'El estudiante ya tiene inscrita esta materia en otro grupo.';
        END IF;

        -- 8. Validar choque de horario
        SELECT COUNT(*)
        INTO v_existe_choque_horario
        FROM inscripcion i
        INNER JOIN grupo g_existente ON g_existente.id_grupo = i.id_grupo
        WHERE i.id_estudiante = NEW.id_estudiante
          AND i.estado = TRUE
          AND g_existente.dia = v_grupo.dia
          AND g_existente.hora_inicio < v_grupo.hora_final
          AND v_grupo.hora_inicio < g_existente.hora_final
          AND i.id_inscripcion <> COALESCE(NEW.id_inscripcion, -1);

        IF v_existe_choque_horario > 0 THEN
            RAISE EXCEPTION 'No se puede inscribir el grupo porque existe choque de horario.';
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- PASO 3: TRIGGER DE VALIDACIÓN DE INSCRIPCIÓN
-- ============================================

DROP TRIGGER IF EXISTS trg_validar_inscripcion ON inscripcion;

CREATE TRIGGER trg_validar_inscripcion
BEFORE INSERT OR UPDATE ON inscripcion
FOR EACH ROW
EXECUTE FUNCTION fn_validar_inscripcion();

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'inscripcion';


-- ============================================
-- PASO 4: FUNCIÓN PARA ACTUALIZAR CUPOS
-- PostgreSQL - ClassMatch
-- ============================================

CREATE OR REPLACE FUNCTION fn_actualizar_cupo_inscripcion()
RETURNS TRIGGER AS $$
BEGIN
    -- CASO 1: Nueva inscripción activa
    IF TG_OP = 'INSERT' THEN

        IF NEW.estado = TRUE THEN
            UPDATE grupo
            SET cupo_disponible = cupo_disponible - 1
            WHERE id_grupo = NEW.id_grupo;
        END IF;

        RETURN NEW;
    END IF;


    -- CASO 2: Cambio de estado de inscripción
    IF TG_OP = 'UPDATE' THEN

        -- Si antes estaba inactiva y ahora activa, resta cupo
        IF OLD.estado = FALSE AND NEW.estado = TRUE THEN
            UPDATE grupo
            SET cupo_disponible = cupo_disponible - 1
            WHERE id_grupo = NEW.id_grupo;
        END IF;

        -- Si antes estaba activa y ahora inactiva, devuelve cupo
        IF OLD.estado = TRUE AND NEW.estado = FALSE THEN
            UPDATE grupo
            SET cupo_disponible = cupo_disponible + 1
            WHERE id_grupo = NEW.id_grupo;
        END IF;

        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- PASO 5: TRIGGER PARA ACTUALIZAR CUPOS
-- ============================================

DROP TRIGGER IF EXISTS trg_actualizar_cupo_inscripcion ON inscripcion;

CREATE TRIGGER trg_actualizar_cupo_inscripcion
AFTER INSERT OR UPDATE ON inscripcion
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_cupo_inscripcion();