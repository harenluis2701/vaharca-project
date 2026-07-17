from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

# --- MOLDES PARA USUARIOS ---

# 1. Molde para los datos que recibimos cuando alguien se registra
class UsuarioCrear(BaseModel):
    nombre: str
    email: EmailStr
    password: str
    rol: str = "CODER" # CODER o TEAM_LEADER
    edad: int | None = 0
    gemini_api_key: str | None = None

# 2. Molde para los datos que devolvemos (¡Sin la contraseña!)
class UsuarioRespuesta(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    rol: str
    edad: int | None = 0
    fecha_registro: datetime

    class Config:
        from_attributes = True # Permite traducir el Modelo de la BD a este esquema de Pydantic

class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str

class ApiKeyUpdate(BaseModel):
    api_key: str

class LeccionGenerar(BaseModel):
    tema: str
    nivel: str
    tipo: str
    ruta_id: int | None = None  # Opcional, por si la lección pertenece a una ruta
    orden: int = 1
    idioma: str = "es"

class LeccionRespuestaIA(BaseModel):
    id: int
    titulo: str
    contenido_json: dict
    orden: int
    estado: Optional[str] = "Pendiente"
    calificacion_ia: Optional[int] = None

    class Config:
        from_attributes = True

class EvaluacionEstudiante(BaseModel):
    leccion_id: int
    respuesta: str

class MensajeChat(BaseModel):
    role: str # 'user' o 'model'
    content: str

class ChatRequest(BaseModel):
    mensajes: list[MensajeChat]
