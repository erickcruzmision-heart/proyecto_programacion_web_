# Documentación de Endpoints - Backend ClassMatch

## 1. Descripción general

El backend de ClassMatch está desarrollado con Node.js, Express y PostgreSQL.

Su función principal es administrar la información del sistema académico, incluyendo:

- Inicio de sesión.
- Usuarios y roles.
- Estudiantes.
- Docentes.
- Cursos.
- Grupos.
- Inscripciones.
- Horarios del estudiante.

La base de datos en PostgreSQL contiene validaciones importantes para proteger la lógica del negocio, especialmente en el proceso de inscripción de materias.

Entre las validaciones principales están:

- Evitar inscribir dos veces la misma materia.
- Evitar choques de horario.
- Validar cupos disponibles.
- Validar que estudiante, curso, grupo y docente estén activos.
- Descontar cupo al inscribir.
- Devolver cupo al cancelar inscripción.

---

## 2. URL base del backend

Para trabajar localmente, la URL base será:

```http
http://localhost:3001
```

Todas las rutas de la API comienzan con:

```http
http://localhost:3001/api
```

---

## 3. Formato general de respuestas

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Operación realizada correctamente",
  "data": {}
}
```

### Respuesta con error

```json
{
  "success": false,
  "message": "Mensaje del error"
}
```

Algunas respuestas de error también pueden incluir:

```json
{
  "success": false,
  "message": "Error al realizar la operación",
  "error": "Detalle técnico del error"
}
```

---

## 4. Autenticación con JWT

El backend usa JWT para proteger las rutas.

Primero se debe iniciar sesión para obtener un token. Luego, en las demás peticiones protegidas, se debe enviar el token en los headers.

### Header requerido

```http
Authorization: Bearer TOKEN_AQUI
```

Ejemplo:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

---

## 5. Endpoint de prueba del servidor

### Verificar que la API funciona

```http
GET /
```

URL completa:

```http
GET http://localhost:3001/
```

Respuesta esperada:

```json
{
  "success": true,
  "message": "API ClassMatch funcionando correctamente"
}
```

### Verificar conexión con PostgreSQL

```http
GET /api/test-db
```

URL completa:

```http
GET http://localhost:3001/api/test-db
```

Respuesta esperada:

```json
{
  "success": true,
  "message": "Conexión a PostgreSQL correcta",
  "data": {
    "fecha_servidor": "2026-05-18T00:00:00.000Z"
  }
}
```

---

## 6. Autenticación

### Iniciar sesión

```http
POST /api/auth/login
```

URL completa:

```http
POST http://localhost:3001/api/auth/login
```

Body esperado:

```json
{
  "correo": "admin@classmatch.com",
  "password": "123456"
}
```

Respuesta exitosa:

```json
{
  "success": true,
  "message": "Inicio de sesión correcto",
  "token": "TOKEN_GENERADO",
  "usuario": {
    "id_usuario": 1,
    "nombre_usuario": "admin",
    "correo": "admin@classmatch.com",
    "rol": "Administrador"
  }
}
```

Uso del token:

```http
Authorization: Bearer TOKEN_GENERADO
```

---

## 7. Cursos

### Obtener todos los cursos

```http
GET /api/cursos
```

URL completa:

```http
GET http://localhost:3001/api/cursos
```

Requiere token.

Respuesta esperada:

```json
{
  "success": true,
  "data": [
    {
      "id_curso": 1,
      "codigo_materia": "PW-I",
      "nombre": "Programación Web I",
      "descripcion": "Curso de desarrollo web básico",
      "estado": true
    }
  ]
}
```

### Crear curso

```http
POST /api/cursos
```

URL completa:

```http
POST http://localhost:3001/api/cursos
```

Requiere token de Administrador.

Body esperado:

```json
{
  "codigo_materia": "BD-I",
  "nombre": "Base de Datos I",
  "descripcion": "Curso de bases de datos relacionales",
  "estado": true
}
```

Respuesta exitosa:

```json
{
  "success": true,
  "message": "Curso creado correctamente",
  "data": {
    "id_curso": 2,
    "codigo_materia": "BD-I",
    "nombre": "Base de Datos I",
    "descripcion": "Curso de bases de datos relacionales",
    "estado": true
  }
}
```

### Actualizar curso

```http
PUT /api/cursos/:id
```

Ejemplo:

```http
PUT http://localhost:3001/api/cursos/1
```

Requiere token de Administrador.

Body esperado:

```json
{
  "codigo_materia": "PW-I",
  "nombre": "Programación Web I Actualizada",
  "descripcion": "Curso actualizado",
  "estado": true
}
```

### Desactivar curso

```http
PUT /api/cursos/desactivar/:id
```

Ejemplo:

```http
PUT http://localhost:3001/api/cursos/desactivar/1
```

Requiere token de Administrador.

Esta ruta no elimina físicamente el curso, solo cambia:

```text
estado = false
```

---

## 8. Docentes

### Obtener todos los docentes

```http
GET /api/docentes
```

URL completa:

```http
GET http://localhost:3001/api/docentes
```

Requiere token.

### Crear docente

```http
POST /api/docentes
```

URL completa:

```http
POST http://localhost:3001/api/docentes
```

Requiere token de Administrador.

Body esperado:

```json
{
  "nombre": "Ana",
  "apellido": "Martínez",
  "correo": "ana@classmatch.com",
  "telefono": "7100-0001",
  "especialidad": "Programación",
  "estado": true
}
```

### Actualizar docente

```http
PUT /api/docentes/:id
```

Ejemplo:

```http
PUT http://localhost:3001/api/docentes/1
```

Requiere token de Administrador.

Body esperado:

```json
{
  "nombre": "Ana",
  "apellido": "Martínez Actualizada",
  "correo": "ana@classmatch.com",
  "telefono": "7100-0001",
  "especialidad": "Programación Web",
  "estado": true
}
```

### Desactivar docente

```http
PUT /api/docentes/desactivar/:id
```

Ejemplo:

```http
PUT http://localhost:3001/api/docentes/desactivar/1
```

Requiere token de Administrador.

---

## 9. Estudiantes

### Obtener todos los estudiantes

```http
GET /api/estudiantes
```

URL completa:

```http
GET http://localhost:3001/api/estudiantes
```

Requiere token de Administrador.

### Obtener estudiante por ID

```http
GET /api/estudiantes/:id
```

Ejemplo:

```http
GET http://localhost:3001/api/estudiantes/1
```

Requiere token.

### Obtener estudiante por usuario

Esta ruta es importante para el frontend.

Cuando el usuario inicia sesión, el login devuelve `id_usuario`. Pero para inscribir materias se necesita `id_estudiante`.

```http
GET /api/estudiantes/usuario/:id_usuario
```

Ejemplo:

```http
GET http://localhost:3001/api/estudiantes/usuario/2
```

Respuesta esperada:

```json
{
  "success": true,
  "data": {
    "id_estudiante": 1,
    "id_usuario": 2,
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan@classmatch.com",
    "dui": "00000001-1",
    "telefono": "7000-0001",
    "estado": true,
    "nombre_usuario": "juanperez",
    "nom_rol": "Estudiante"
  }
}
```

### Crear estudiante

```http
POST /api/estudiantes
```

URL completa:

```http
POST http://localhost:3001/api/estudiantes
```

Requiere token de Administrador.

Esta ruta crea al estudiante y también crea su usuario de acceso.

Body esperado:

```json
{
  "nombre_usuario": "pedroramirez",
  "password": "123456",
  "nombre": "Pedro",
  "apellido": "Ramírez",
  "correo": "pedro@classmatch.com",
  "dui": "00000004-4",
  "telefono": "7000-0004",
  "estado": true
}
```

Respuesta esperada:

```json
{
  "success": true,
  "message": "Estudiante creado correctamente",
  "data": {
    "usuario": {
      "id_usuario": 5,
      "nombre_usuario": "pedroramirez",
      "correo": "pedro@classmatch.com",
      "estado": true
    },
    "estudiante": {
      "id_estudiante": 4,
      "id_usuario": 5,
      "nombre": "Pedro",
      "apellido": "Ramírez",
      "correo": "pedro@classmatch.com",
      "dui": "00000004-4",
      "telefono": "7000-0004",
      "estado": true
    }
  }
}
```

### Actualizar estudiante

```http
PUT /api/estudiantes/:id
```

Ejemplo:

```http
PUT http://localhost:3001/api/estudiantes/1
```

Requiere token de Administrador.

Body esperado:

```json
{
  "nombre_usuario": "juanperez",
  "nombre": "Juan",
  "apellido": "Pérez Actualizado",
  "correo": "juan@classmatch.com",
  "dui": "00000001-1",
  "telefono": "7000-1111",
  "estado": true
}
```

### Desactivar estudiante

```http
PUT /api/estudiantes/desactivar/:id
```

Ejemplo:

```http
PUT http://localhost:3001/api/estudiantes/desactivar/1
```

Requiere token de Administrador.

Esta ruta desactiva tanto el estudiante como su usuario relacionado.

---

## 10. Grupos

### Obtener todos los grupos

```http
GET /api/grupos
```

URL completa:

```http
GET http://localhost:3001/api/grupos
```

Requiere token.

### Obtener grupos disponibles

```http
GET /api/grupos/disponibles
```

URL completa:

```http
GET http://localhost:3001/api/grupos/disponibles
```

Requiere token.

Devuelve únicamente grupos que:

- Están activos.
- Tienen curso activo.
- Tienen docente activo.
- Tienen cupo disponible.

### Crear grupo

```http
POST /api/grupos
```

URL completa:

```http
POST http://localhost:3001/api/grupos
```

Requiere token de Administrador.

Body esperado:

```json
{
  "codigo": "G1",
  "id_curso": 1,
  "id_docente": 1,
  "cupo_maximo": 30,
  "modalidad": "Presencial",
  "aula": "Aula 101",
  "dia": "Lunes",
  "hora_inicio": "08:00",
  "hora_final": "10:00",
  "estado": true
}
```

Al crear un grupo, el backend asigna automáticamente:

```text
cupo_disponible = cupo_maximo
```

### Actualizar grupo

```http
PUT /api/grupos/:id
```

Ejemplo:

```http
PUT http://localhost:3001/api/grupos/1
```

Requiere token de Administrador.

Body esperado:

```json
{
  "codigo": "G1",
  "id_curso": 1,
  "id_docente": 1,
  "cupo_maximo": 30,
  "cupo_disponible": 25,
  "modalidad": "Presencial",
  "aula": "Aula 101",
  "dia": "Lunes",
  "hora_inicio": "08:00",
  "hora_final": "10:00",
  "estado": true
}
```

### Desactivar grupo

```http
PUT /api/grupos/desactivar/:id
```

Ejemplo:

```http
PUT http://localhost:3001/api/grupos/desactivar/1
```

Requiere token de Administrador.

---

## 11. Inscripciones

### Obtener todas las inscripciones

```http
GET /api/inscripciones
```

URL completa:

```http
GET http://localhost:3001/api/inscripciones
```

Requiere token.

### Obtener inscripciones de un estudiante

```http
GET /api/inscripciones/estudiante/:id_estudiante
```

Ejemplo:

```http
GET http://localhost:3001/api/inscripciones/estudiante/1
```

Requiere token.

Devuelve las materias inscritas por el estudiante, tanto activas como canceladas.

### Obtener horario del estudiante

```http
GET /api/inscripciones/horario/:id_estudiante
```

Ejemplo:

```http
GET http://localhost:3001/api/inscripciones/horario/1
```

Requiere token.

Devuelve solo las inscripciones activas del estudiante, ordenadas por día y hora.

Respuesta esperada:

```json
{
  "success": true,
  "data": [
    {
      "curso": "Programación Web I",
      "grupo": "G1",
      "docente": "Ana Martínez",
      "modalidad": "Presencial",
      "aula": "Aula 101",
      "dia": "Lunes",
      "hora_inicio": "08:00:00",
      "hora_final": "10:00:00"
    }
  ]
}
```

### Crear inscripción

```http
POST /api/inscripciones
```

URL completa:

```http
POST http://localhost:3001/api/inscripciones
```

Requiere token.

Body esperado:

```json
{
  "id_estudiante": 1,
  "id_grupo": 4
}
```

Respuesta exitosa:

```json
{
  "success": true,
  "message": "Inscripción registrada correctamente",
  "data": {
    "id_inscripcion": 1,
    "id_estudiante": 1,
    "id_grupo": 4,
    "fecha_inscripcion": "2026-05-18T00:00:00.000Z",
    "estado": true
  }
}
```

Errores posibles desde PostgreSQL:

```json
{
  "success": false,
  "message": "El estudiante ya tiene inscrita esta materia en otro grupo."
}
```

```json
{
  "success": false,
  "message": "No se puede inscribir el grupo porque existe choque de horario."
}
```

```json
{
  "success": false,
  "message": "El grupo seleccionado ya no tiene cupos disponibles."
}
```

```json
{
  "success": false,
  "message": "El estudiante se encuentra inactivo y no puede inscribirse."
}
```

### Cancelar inscripción

```http
PUT /api/inscripciones/cancelar/:id
```

Ejemplo:

```http
PUT http://localhost:3001/api/inscripciones/cancelar/1
```

El `id` corresponde a `id_inscripcion`.

Requiere token.

Respuesta esperada:

```json
{
  "success": true,
  "message": "Inscripción cancelada correctamente",
  "data": {
    "id_inscripcion": 1,
    "id_estudiante": 1,
    "id_grupo": 4,
    "fecha_inscripcion": "2026-05-18T00:00:00.000Z",
    "estado": false
  }
}
```

Al cancelar una inscripción, PostgreSQL devuelve automáticamente el cupo al grupo.

---

## 12. Flujo recomendado para el frontend

### Flujo de login de administrador

```text
1. El administrador inicia sesión.
2. Se guarda el token JWT.
3. Con el token puede crear cursos, docentes, estudiantes y grupos.
```

### Flujo de login de estudiante

```text
1. El estudiante inicia sesión.
2. El login devuelve id_usuario y token.
3. El frontend consulta:
   GET /api/estudiantes/usuario/:id_usuario
4. El backend devuelve id_estudiante.
5. Con id_estudiante, el frontend puede consultar:
   GET /api/inscripciones/horario/:id_estudiante
   GET /api/inscripciones/estudiante/:id_estudiante
6. El estudiante puede inscribirse usando:
   POST /api/inscripciones
```

### Flujo de inscripción

```text
1. El frontend muestra grupos disponibles.
2. El estudiante selecciona un grupo.
3. El frontend envía id_estudiante e id_grupo.
4. PostgreSQL valida:
   - Cupo disponible.
   - Materia no repetida.
   - Sin choque de horario.
   - Estados activos.
5. Si todo está bien, se registra la inscripción.
6. Se descuenta el cupo.
7. El frontend actualiza el horario.
```

---

## 13. Reglas importantes para frontend

### No confiar solo en el frontend

Aunque el frontend pueda validar campos vacíos o mostrar alertas, las validaciones importantes están en la base de datos.

Por ejemplo:

- Choque de horario.
- Misma materia.
- Cupo disponible.
- Estados activos.

Por eso, si el backend devuelve un error, el frontend debe mostrar el `message` recibido.

### Siempre enviar token

Todas las rutas protegidas necesitan:

```http
Authorization: Bearer TOKEN
```

Si no se manda, el backend responderá:

```json
{
  "success": false,
  "message": "Token no proporcionado"
}
```

### Guardar datos útiles del login

Después del login, el frontend debería guardar temporalmente:

```text
token
id_usuario
correo
rol
nombre_usuario
```

Si el rol es estudiante, debe consultar el `id_estudiante`.

---

## 14. Rutas principales resumidas

### Auth

```http
POST /api/auth/login
```

### Cursos

```http
GET /api/cursos
POST /api/cursos
PUT /api/cursos/:id
PUT /api/cursos/desactivar/:id
```

### Docentes

```http
GET /api/docentes
POST /api/docentes
PUT /api/docentes/:id
PUT /api/docentes/desactivar/:id
```

### Estudiantes

```http
GET /api/estudiantes
GET /api/estudiantes/:id
GET /api/estudiantes/usuario/:id_usuario
POST /api/estudiantes
PUT /api/estudiantes/:id
PUT /api/estudiantes/desactivar/:id
```

### Grupos

```http
GET /api/grupos
GET /api/grupos/disponibles
POST /api/grupos
PUT /api/grupos/:id
PUT /api/grupos/desactivar/:id
```

### Inscripciones

```http
GET /api/inscripciones
GET /api/inscripciones/estudiante/:id_estudiante
GET /api/inscripciones/horario/:id_estudiante
POST /api/inscripciones
PUT /api/inscripciones/cancelar/:id
```

---

## 15. Recomendación para pruebas en Postman o Thunder Client

Para probar cualquier ruta protegida:

1. Hacer login.
2. Copiar el token.
3. Ir a la ruta que se desea probar.
4. En Headers agregar:

```http
Authorization: Bearer TOKEN
```

5. Si es `POST` o `PUT`, agregar:

```http
Content-Type: application/json
```

6. Enviar el body en formato JSON.
