from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import traceback
import os
from dotenv import load_dotenv

# Importaciones de nuestros módulos internos de Vaharca
from database.connection import get_db
import database.models as models
import schemas
from security import get_password_hash, verify_password
from gemini_service import generar_leccion_ia

# Cargar variables de entorno (si usas el archivo .env)
load_dotenv()

# Inicializar la aplicación FastAPI
app = FastAPI(title="API de Vaharca", version="1.0.0")

# Configurar CORS para el frontend local
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5501",
        "http://localhost:5501",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# RUTAS DE ESTADO Y DIAGNÓSTICO
# ==========================================

@app.get("/")
async def root():
    return {"mensaje": "¡El servidor de Vaharca está encendido y funcionando!"}

@app.get("/test-connection")
async def test_connection():
    """Endpoint simple para verificar que el servidor funciona"""
    return {
        "status": "online",
        "message": "Servidor funcionando correctamente"
    }


# ==========================================
# RUTAS DE USUARIOS Y SEGURIDAD (FASE 3)
# ==========================================

@app.post("/registro", response_model=schemas.UsuarioRespuesta)
async def registrar_usuario(usuario: schemas.UsuarioCrear, db: Session = Depends(get_db)):
    """
    Registra un nuevo usuario en la base de datos encriptando su contraseña.
    Devuelve los datos del usuario usando el esquema seguro (sin la contraseña).
    """
    # 1. Verificar si el correo ya existe
    usuario_existente = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El correo ya está registrado.")
    
    # 2. Encriptar la contraseña
    password_encriptada = get_password_hash(usuario.password)
    
    # 3. Crear el nuevo registro
    nuevo_usuario = models.Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        password_hash=password_encriptada,
        rol=usuario.rol,
        gemini_api_key=usuario.gemini_api_key
    )
    
    # 4. Guardar en PostgreSQL
    try:
        db.add(nuevo_usuario)
        db.commit()
        db.refresh(nuevo_usuario)
        return nuevo_usuario # FastAPI automáticamente lo pasa por UsuarioRespuesta
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al guardar en BD: {str(e)}")


@app.post("/login")
async def iniciar_sesion(datos: schemas.UsuarioLogin, db: Session = Depends(get_db)):
    """
    Authentica al usuario y devuelve token de sesión.
    """
    usuario = db.query(models.Usuario).filter(models.Usuario.email == datos.email).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos.")

    if not verify_password(datos.password, usuario.password_hash):
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos.")

    # En este demo devolvemos token fijo y datos de usuario.
    return {
        "token": "TOKEN_DE_PRUEBA",
        "user": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "rol": usuario.rol,
        }
    }


# ==========================================
# RUTAS DE INTELIGENCIA ARTIFICIAL (FASE 2)
# ==========================================

@app.get("/test-gemini")
async def test_gemini(
    api_key: str = Query(None),
    tema: str = Query(...),
    nivel: str = Query(...),
    tipo: str = Query(...)
):
    """Endpoint para generar lecciones usando Gemini"""
    try:
        # Usar API key del parámetro o del .env
        key = api_key or os.getenv("GOOGLE_API_KEY")
        if not key:
            return JSONResponse(
                status_code=400,
                content={"error": "No se proporcionó API key válida"}
            )
        
        # Llamar a nuestro servicio de IA
        resultado = generar_leccion_ia(key, tema, nivel, tipo)
        
        if "error" in resultado:
            return JSONResponse(status_code=500, content=resultado)
            
        return JSONResponse(content={"status": "success", "data": resultado})
        
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": "Error interno", "detalle": str(e)}
        )

@app.get("/list-gemini-models")
async def list_gemini_models(api_key: str = Query(None)):
    """Lista los modelos disponibles de Gemini para depuración"""
    try:
        import google.generativeai as genai
        key = api_key or os.getenv("GOOGLE_API_KEY")
        if not key:
            return JSONResponse(status_code=400, content={"error": "Falta API key"})
            
        genai.configure(api_key=key)
        modelos = [
            {"name": model.name, "display_name": model.display_name} 
            for model in genai.list_models() 
            if 'generateContent' in model.supported_generation_methods
        ]
        
        return JSONResponse(content={
            "total": len(modelos),
            "modelos": modelos,
            "recomendacion": "Usa 'gemini-2.0-flash' o 'gemini-flash-latest' para mejor compatibilidad"
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})