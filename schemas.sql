-- 1. Tabla de Usuarios (Manejo de Roles para Team Leader y Coders)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('TEAM_LEADER', 'CODER')) NOT NULL,
    edad INT DEFAULT 0,
    gemini_api_key VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Rutas de Aprendizaje (Ej: Python Básico, Inglés A1)
CREATE TABLE rutas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    nivel VARCHAR(50) NOT NULL, 
    tipo VARCHAR(50) CHECK (tipo IN ('CODIGO', 'INGLES')) NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('Borrador', 'Publicada')) DEFAULT 'Borrador',
    creado_por INT REFERENCES usuarios(id)
);

-- 3. Tabla de Lecciones (Aquí se guardará lo que genere la IA de Gemini)
CREATE TABLE lecciones (
    id SERIAL PRIMARY KEY,
    ruta_id INT REFERENCES rutas(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    contenido_json JSONB NOT NULL, 
    orden INT NOT NULL
);

-- 4. Tabla de Progreso (Para medir el avance del Coder y las notas de la IA)
CREATE TABLE progreso_coder (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    leccion_id INT REFERENCES lecciones(id) ON DELETE CASCADE,
    estado VARCHAR(20) CHECK (estado IN ('Pendiente', 'Completada', 'Aprobado', 'Reprobado')) DEFAULT 'Pendiente',
    respuesta_estudiante TEXT,
    calificacion_ia INT,
    feedback_ia TEXT, 
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, leccion_id)
);