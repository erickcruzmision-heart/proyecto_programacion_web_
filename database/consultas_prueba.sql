-- ============================================
-- PASO 7: DATOS DE PRUEBA CONTROLADOS
-- PostgreSQL - ClassMatch
-- ============================================

INSERT INTO inscripcion (id_estudiante, id_grupo, estado)
VALUES (1, 1, TRUE);

SELECT * FROM inscripcion;

SELECT id_grupo, codigo, cupo_maximo, cupo_disponible
FROM grupo
WHERE id_grupo = 1;

--Prueba 2: Bloqueo por misma materia en otro grupo
--Juan intenta inscribirse otra vez en Programación Web I, pero en Grupo 2.

INSERT INTO inscripcion (id_estudiante, id_grupo, estado)
VALUES (1, 2, TRUE);

--Prueba 3: Bloqueo por choque de horario
--Juan intenta inscribirse en Base de Datos I, lunes de 09:00 a 11:00.
--Ya tiene Programación Web I, lunes de 08:00 a 10:00.

INSERT INTO inscripcion (id_estudiante, id_grupo, estado)
VALUES (1, 3, TRUE);

--Prueba 4: Inscripción sin choque
--Juan se inscribe en Matemática I, miércoles de 08:00 a 10:00.

INSERT INTO inscripcion (id_estudiante, id_grupo, estado)
VALUES (1, 4, TRUE);

--Verificamos el cupo
SELECT id_grupo, codigo, cupo_maximo, cupo_disponible
FROM grupo
WHERE id_grupo = 4;

--Prueba 5: Bloqueo por cupo lleno
--María intenta inscribirse en Matemática I, pero el cupo ya quedó en 0.

INSERT INTO inscripcion (id_estudiante, id_grupo, estado)
VALUES (2, 4, TRUE);

--Prueba 6: Bloqueo por estudiante inactivo
--Carlos está inactivo e intenta inscribirse.

INSERT INTO inscripcion (id_estudiante, id_grupo, estado)
VALUES (3, 1, TRUE);


--Prueba 7: Bloqueo por curso inactivo
--María intenta inscribirse en Redes I, pero el curso está inactivo.

INSERT INTO inscripcion (id_estudiante, id_grupo, estado)
VALUES (2, 5, TRUE);

--Prueba 8: Bloqueo por docente inactivo
--María intenta inscribirse en un grupo donde el docente está inactivo.

INSERT INTO inscripcion (id_estudiante, id_grupo, estado)
VALUES (2, 6, TRUE);

--Prueba 9: Bloqueo por grupo inactivo
--María intenta inscribirse en un grupo inactivo.

INSERT INTO inscripcion (id_estudiante, id_grupo, estado)
VALUES (2, 7, TRUE);

--Paso 8: Probar cancelación y devolución de cupo
--Primero revisa las inscripciones actuales:

SELECT 
    i.id_inscripcion,
    e.nombre || ' ' || e.apellido AS estudiante,
    c.nombre AS curso,
    g.codigo AS grupo,
    g.dia,
    g.hora_inicio,
    g.hora_final,
    i.estado
FROM inscripcion i
INNER JOIN estudiante e ON e.id_estudiante = i.id_estudiante
INNER JOIN grupo g ON g.id_grupo = i.id_grupo
INNER JOIN curso c ON c.id_curso = g.id_curso
ORDER BY i.id_inscripcion;

--Ahora cancela la inscripción de Juan en Matemática I. 
--Según el orden de pruebas, normalmente será la inscripción id_inscripcion = 4.

UPDATE inscripcion
SET estado = FALSE
WHERE id_inscripcion = 4;

SELECT id_grupo, codigo, cupo_maximo, cupo_disponible
FROM grupo
WHERE id_grupo = 4;

--Paso 9: Probar que María ahora sí puede tomar ese cupo
--Como Juan canceló Matemática I, María debería poder inscribirse.

INSERT INTO inscripcion (id_estudiante, id_grupo, estado)
VALUES (2, 4, TRUE);

SELECT id_grupo, codigo, cupo_maximo, cupo_disponible
FROM grupo
WHERE id_grupo = 4;

SELECT 
    i.id_inscripcion,
    e.nombre || ' ' || e.apellido AS estudiante,
    c.nombre AS curso,
    g.codigo AS grupo,
    g.dia,
    g.hora_inicio,
    g.hora_final,
    i.fecha_inscripcion,
    i.estado AS inscripcion_activa
FROM inscripcion i
INNER JOIN estudiante e ON e.id_estudiante = i.id_estudiante
INNER JOIN grupo g ON g.id_grupo = i.id_grupo
INNER JOIN curso c ON c.id_curso = g.id_curso
ORDER BY i.id_inscripcion;