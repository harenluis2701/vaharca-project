from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

# Configuración del encriptador de contraseñas (Bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuración de los Tokens JWT
SECRET_KEY = os.getenv("SECRET_KEY", "clave_de_respaldo_secreta")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # El carnet durará 1 hora

def get_password_hash(password: str):
    """Encripta una contraseña antes de guardarla en la base de datos"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    """Compara una contraseña de login con el Hash guardado en la BD"""
    return pwd_context.verify(plain_password, hashed_password)

def crear_token_acceso(datos: dict):
    """Imprime el carnet virtual (JWT) para el usuario"""
    datos_a_codificar = datos.copy()
    
    # Le agregamos la fecha de vencimiento al carnet
    fecha_expiracion = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    datos_a_codificar.update({"exp": fecha_expiracion})
    
    # Sellamos el carnet con la llave secreta
    token_jwt = jwt.encode(datos_a_codificar, SECRET_KEY, algorithm=ALGORITHM)
    return token_jwt