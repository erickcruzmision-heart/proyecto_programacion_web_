# Backend ClassMatch

## Descripción

Backend del sistema ClassMatch, desarrollado con Node.js, Express y PostgreSQL.

Este backend permite gestionar autenticación, cursos, docentes, estudiantes, grupos e inscripciones académicas.

La lógica principal del proyecto consiste en permitir que un estudiante se inscriba a grupos disponibles, evitando choques de horario, materias repetidas y grupos sin cupo.

Las validaciones más importantes se apoyan en PostgreSQL, mientras que el backend se encarga de recibir peticiones, consultar la base de datos y devolver respuestas claras al frontend.

---

## Tecnologías usadas

- Node.js
- Express
- PostgreSQL
- JWT
- bcryptjs
- dotenv
- cors
- pg
- nodemon

---

## Estructura general del backend

```text
backend/
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── cursosController.js
│   │   ├── docentesController.js
│   │   ├── estudiantesController.js
│   │   ├── gruposController.js
│   │   └── inscripcionesController.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── cursosRoutes.js
│   │   ├── docentesRoutes.js
│   │   ├── estudiantesRoutes.js
│   │   ├── gruposRoutes.js
│   │   └── inscripcionesRoutes.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── rolMiddleware.js
│   │
│   └── server.js
│
├── .env
├── .env.example
├── .gitignore
└── package.json
```

---

## Instalación

Desde la carpeta `backend`, ejecutar:

```bash
npm install
```

---

## Configuración del archivo `.env`

Crear un archivo `.env` en la carpeta `backend` con el siguiente contenido:

```env
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_NAME=classmatch
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD

JWT_SECRET=classmatch_secret_key
JWT_EXPIRES_IN=2h
```

Cambiar `TU_PASSWORD` por la contraseña real de PostgreSQL en la máquina local.

---

## Archivo `.env.example`

Este archivo sirve como plantilla para los demás integrantes del equipo.

```env
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_NAME=classmatch
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=2h
```

El archivo `.env` real no debe subirse al repositorio.

---

## Ejecutar servidor en desarrollo

```bash
npm run dev
```

Si todo está correcto, debe aparecer algo similar a:

```text
Conectado a PostgreSQL
Servidor ClassMatch ejecutándose en puerto 3001
```

---

## Ejecutar servidor normal

```bash
npm start
```

---

## Probar que la API funciona

Abrir en navegador, Postman o Thunder Client:

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

---

## Probar conexión con PostgreSQL

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

## Autenticación

El backend usa JWT para proteger las rutas.

Primero se debe iniciar sesión:

```http
POST http://localhost:3001/api/auth/login
```

Body de ejemplo:

```json
{
  "correo": "admin@classmatch.com",
  "password": "123456"
}
```

Respuesta esperada:

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

---

## Uso del token JWT

Para consumir rutas protegidas, enviar el token en los headers:

```http
Authorization: Bearer TOKEN_GENERADO
```

También se recomienda enviar:

```http
Content-Type: application/json
```

---

## Roles principales

El sistema maneja dos roles básicos:

```text
Administrador
Estudiante
```

### Administrador

Puede gestionar:

- Cursos.
- Docentes.
- Estudiantes.
- Grupos.
- Inscripciones.

### Estudiante

Puede:

- Ver grupos disponibles.
- Inscribirse.
- Ver su horario.
- Cancelar inscripción.

---

## Módulos disponibles

El backend cuenta con los siguientes módulos:

```text
Auth
Cursos
Docentes
Estudiantes
Grupos
Inscripciones
```

---

## Endpoints principales

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

## Flujo recomendado para frontend

### Flujo de administrador

```text
1. Iniciar sesión.
2. Guardar token JWT.
3. Usar el token para gestionar cursos, docentes, estudiantes y grupos.
```

### Flujo de estudiante

```text
1. Iniciar sesión.
2. Guardar token JWT e id_usuario.
3. Consultar el estudiante relacionado:
   GET /api/estudiantes/usuario/:id_usuario
4. Obtener id_estudiante.
5. Consultar grupos disponibles:
   GET /api/grupos/disponibles
6. Crear inscripción:
   POST /api/inscripciones
7. Consultar horario:
   GET /api/inscripciones/horario/:id_estudiante
```

---

## Validaciones principales manejadas por PostgreSQL

Durante una inscripción, la base de datos valida:

- Que el estudiante esté activo.
- Que el grupo esté activo.
- Que el curso esté activo.
- Que el docente esté activo.
- Que exista cupo disponible.
- Que el estudiante no inscriba dos veces la misma materia.
- Que no exista choque de horario.

Además:

- Al inscribir, se descuenta cupo automáticamente.
- Al cancelar inscripción, se devuelve el cupo automáticamente.

---

## Documentación detallada de endpoints

La documentación detallada para el equipo de frontend-backend está en:

```text
docs/endpoints_backend.md
```

Ahí se explica:

- Método HTTP.
- URL.
- Body esperado.
- Respuesta esperada.
- Token requerido.
- Rol requerido.
- Flujo recomendado para frontend.
