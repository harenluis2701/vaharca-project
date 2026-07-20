# Vaharca 🚀

Vaharca es una plataforma web full-stack diseñada para la enseñanza y evaluación asistida por Inteligencia Artificial (Google Gemini). La aplicación cuenta con un backend robusto y de alto rendimiento en Python y un frontend ligero y rápido.

## 🛠️ Stack Tecnológico

### Backend
* **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
* **Base de Datos:** PostgreSQL
* **ORM:** SQLAlchemy (usando `pg8000` como driver)
* **Autenticación:** JWT (JSON Web Tokens)
* **IA:** Google Gemini API (para generación de contenido y evaluación)

### Frontend
* **Core:** Vanilla JavaScript (ES6+), HTML5, CSS3
* **Build Tool:** [Vite](https://vitejs.dev/)

---

## 📁 Estructura del Proyecto

El proyecto está organizado en una arquitectura de monorepo separando claramente la lógica del servidor de la interfaz de usuario:

```text
vaharca-backend/
├── main.py                 # Punto de entrada de la API (FastAPI) y rutas principales
├── gemini_service.py       # Lógica de integración con la API de Google Gemini
├── security.py             # Utilidades de seguridad (Hashing de contraseñas, JWT)
├── schemas.py              # Definición de esquemas Pydantic para validación de datos
├── database/               # Configuración y modelos de la Base de Datos
│   ├── connection.py       # Conexión a PostgreSQL
│   └── models.py           # Modelos ORM de SQLAlchemy
├── frontend/               # Código fuente del Frontend
│   ├── index.html          # Punto de entrada HTML
│   ├── package.json        # Dependencias de Vite
│   ├── vite.config.js      # Configuración de compilación de Vite
│   ├── src/                # Lógica de la interfaz, componentes y vistas en Vanilla JS
│   └── css/                # Estilos personalizados
├── .env                    # Variables de entorno (API Keys, Credenciales de DB)
└── requirements.txt        # Dependencias de Python (si aplica, o Pipfile)
```

---

## 🚀 Instalación y Configuración Local

Para ejecutar este proyecto en tu máquina local, sigue estos pasos:

### 1. Prerrequisitos
* Python 3.10 o superior
* Node.js (versión 18+)
* PostgreSQL instalado y en ejecución

### 2. Configuración del Backend

1. **Clonar el repositorio y navegar a la carpeta:**
   ```bash
   git clone <url-del-repo>
   cd vaharca-backend
   ```

2. **Crear y activar un entorno virtual:**
   ```bash
   python -m venv venv
   # En Windows:
   venv\Scripts\activate
   # En macOS/Linux:
   source venv/bin/activate
   ```

3. **Instalar dependencias:**
   Asegúrate de instalar los paquetes necesarios (FastAPI, Uvicorn, SQLAlchemy, psycopg2/pg8000, PyJWT, python-dotenv, google-generativeai).
   ```bash
   pip install fastapi uvicorn sqlalchemy pg8000 pyjwt python-dotenv google-generativeai
   ```

4. **Variables de Entorno (.env):**
   Crea un archivo `.env` en la raíz del proyecto con la siguiente estructura:
   ```env
   DB_USER=tu_usuario_postgres
   DB_PASSWORD=tu_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=nombre_de_tu_bd
   ```
   *(Nota: La API Key de Gemini se configura dinámicamente desde el panel de administrador en el frontend).*

5. **Ejecutar el Servidor:**
   ```bash
   uvicorn main:app --reload
   ```
   La API estará disponible en `http://localhost:8000`. Puedes ver la documentación interactiva en `http://localhost:8000/docs`.

### 3. Configuración del Frontend

1. **Abrir una nueva terminal y navegar al frontend:**
   ```bash
   cd vaharca-backend/frontend
   ```

2. **Instalar dependencias de Node:**
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo Vite:**
   ```bash
   npm run dev
   ```
   La aplicación web estará disponible, por defecto, en `http://localhost:5173`.

---

## ⚙️ ¿Cómo funciona?

1. **Autenticación:** Los usuarios se registran e inician sesión. El backend valida las credenciales y devuelve un token JWT que el frontend almacena y envía en las cabeceras (`Authorization: Bearer <token>`) para rutas protegidas.
2. **Generación de Lecciones:** Un usuario con permisos puede solicitar a la IA la creación de una lección. El frontend envía la petición al backend, y `gemini_service.py` se comunica con Google Gemini usando la API Key configurada.
3. **Persistencia:** Todos los datos de usuarios, lecciones y progresos se guardan en PostgreSQL a través de SQLAlchemy, garantizando integridad relacional.
4. **CORS:** El backend (FastAPI) está configurado para aceptar peticiones originadas desde el puerto de desarrollo de Vite (5173).

## 🛡️ Licencia
Este proyecto es privado/propietario.
