from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

# --- MOLDES PARA USUARIOS ---

# 1. Molde para los datos que recibimos cuando alguien se registra
class UsuarioCrear(BaseModel):
    nombre: str
    email: EmailStr  # Valida automáticamente que sea un correo real
    password: str
    rol: str

# 2. Molde para los datos que devolvemos (¡Sin la contraseña!)
class UsuarioRespuesta(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    rol: str
    fecha_registro: datetime

    class Config:
        from_attributes = True # Permite traducir el Modelo de la BD a este esquema de Pydantic