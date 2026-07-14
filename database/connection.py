import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# 1. Cargar las contraseñas del archivo .env
load_dotenv()

# 2. Leer las variables
usuario = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
host = os.getenv("DB_HOST")
puerto = os.getenv("DB_PORT")
base_datos = os.getenv("DB_NAME")

# 3. Armar la URL de conexión de PostgreSQL
URL_BASE_DATOS = f"postgresql+pg8000://{usuario}:{password}@{host}:{puerto}/{base_datos}"

# 4. Crear el "motor" (engine) que se conecta a la base de datos
engine = create_engine(URL_BASE_DATOS)

# 5. Crear la fábrica de sesiones (para que cada vez que alguien use la app, se abra una sesión)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()