
import os
import traceback
import jwt
from dotenv import load_dotenv

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from database.connection import get_db
import database.models as models
import schemas

# Importaciones internas de Vaharca
from security import get_password_hash, verify_password, crear_token_acceso
from gemini_service import generar_leccion_ia, evaluar_respuesta_ia


# Cargar variables de entorno (si usas el archivo .env)
load_dotenv()

# Inicializar la aplicación FastAPI
app = FastAPI(title="API de Vaharca", version="1.0.0")

# ==========================================
# CONFIGURACIÓN DE CORS (PUENTE PARA EL FRONTEND)
# ==========================================
origenes_permitidos = [
    "http://localhost:5173",    # Puerto por defecto de Vite
    "http://127.0.0.1:5173",    # Variante del localhost
    "http://localhost:3000"     # Por si acaso usas otro puerto más adelante
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origenes_permitidos, # Permite a estos dominios hablar con el backend
    allow_credentials=True,            # Permite el envío de cookies/carnets
    allow_methods=["*"],               # Permite todos los métodos (GET, POST, PUT, DELETE)
    allow_headers=["*"],               # Permite todas las cabeceras (incluyendo la del token JWT)
)
# ==========================================


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
# EL GUARDIA DE SEGURIDAD (JWT)
# ==========================================
from security import SECRET_KEY, ALGORITHM # Traemos el sello secreto

esquema_seguridad = HTTPBearer()

def obtener_usuario_actual(credenciales: HTTPAuthorizationCredentials = Depends(esquema_seguridad)):
    """El guardia lee el carnet y verifica si es auténtico"""
    token = credenciales.credentials
    try:
        # Intenta desencriptar el carnet usando nuestro sello secreto
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload # Devuelve los datos del carnet (email, rol)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="El carnet ha vencido. Inicia sesión de nuevo.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Carnet inválido o falso.")

def requerir_team_leader(usuario = Depends(obtener_usuario_actual)):
    """El guardia verifica que el usuario sea el Jefe del Equipo"""
    if usuario.get("rol") != "TEAM_LEADER":
        raise HTTPException(status_code=403, detail="Acceso denegado. Solo los Team Leaders pueden crear clases.")
    return usuario

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
        edad=usuario.edad,
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


# NUUUEVA VENTANILLA: ENDPOINT DE LOGIN
@app.post("/login", tags=["Autenticación"])
async def login(credenciales: schemas.UsuarioLogin, db: Session = Depends(get_db)):
    """
    Ventanilla para iniciar sesión. Valida la contraseña y entrega el carnet virtual (Token JWT).
    """
    # 1. Buscar al usuario por correo
    usuario = db.query(models.Usuario).filter(models.Usuario.email == credenciales.email).first()
    
    # 2. Si el usuario no existe, o si la contraseña no coincide con el hash
    if not usuario or not verify_password(credenciales.password, usuario.password_hash):
        raise HTTPException(status_code=400, detail="Correo o contraseña incorrectos.")
    
    # 3. ¡LA MAGIA DEL CARNET! Crear el token JWT
    # Metemos dentro del carnet los datos clave: email y rol
    datos_del_carnet = {
        "sub": usuario.email, 
        "rol": usuario.rol
    }
    token_jwt = crear_token_acceso(datos_del_carnet)

    # 4. Entregar la respuesta con el carnet incluido
    return {
        "status": "success",
        "message": f"¡Bienvenido de nuevo, {usuario.nombre}!",
        "access_token": token_jwt,  # ¡Aquí va el carnet encriptado!
        "token_type": "bearer",
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "rol": usuario.rol,
            "edad": usuario.edad,
            "fecha_registro": usuario.fecha_registro.isoformat(),
            "gemini_api_key": usuario.gemini_api_key
        }
    }

@app.put("/usuarios/me/apikey", tags=["Usuarios"])
async def actualizar_api_key(
    datos: schemas.ApiKeyUpdate, 
    db: Session = Depends(get_db), 
    usuario_actual = Depends(obtener_usuario_actual)
):
    """
    Permite al usuario logueado actualizar su propia API Key de Gemini.
    """
    usuario = db.query(models.Usuario).filter(models.Usuario.email == usuario_actual.get("sub")).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    usuario.gemini_api_key = datos.api_key
    try:
        db.commit()
        return {"status": "success", "message": "API Key actualizada correctamente."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al guardar la API Key: {str(e)}")

# ==========================================
# RUTAS DE INTELIGENCIA ARTIFICIAL (FASE 2)
# ==========================================
# NUUUEVA VENTANILLA MAESTRA: GENERAR Y GUARDAR LECCIÓN
@app.post("/generar-leccion", response_model=schemas.LeccionRespuestaIA, tags=["Inteligencia Artificial"])
async def generar_y_guardar_leccion(
    datos_leccion: schemas.LeccionGenerar, 
    db: Session = Depends(get_db),
    usuario_actual = Depends(requerir_team_leader) ):
    """
    Genera una lección con Gemini y la guarda automáticamente en PostgreSQL.
    """
    try:
        # 1. Obtener la llave de Gemini del usuario o del entorno (.env)
        usuario_db = db.query(models.Usuario).filter(models.Usuario.email == usuario_actual.get("sub")).first()
        api_key = (usuario_db.gemini_api_key if usuario_db else None) or os.getenv("GOOGLE_API_KEY")
        
        if not api_key:
            raise HTTPException(status_code=500, detail="API Key de Gemini no configurada.")

        # 2. Llamar al cerebro de Gemini para generar el contenido
        resultado_ia = generar_leccion_ia(
            api_key=api_key,
            tema=datos_leccion.tema,
            nivel=datos_leccion.nivel,
            tipo=datos_leccion.tipo,
            idioma=datos_leccion.idioma
        )

        # Si Gemini nos devuelve un error, detenemos todo
        if "error" in resultado_ia:
            raise HTTPException(status_code=500, detail=f"Error de Gemini: {resultado_ia['error']}")

        # 3. Preparar los datos para la bóveda
        # Extraemos el título si Gemini lo mandó, si no, le ponemos uno por defecto
        titulo_leccion = resultado_ia.get("titulo", f"Lección sobre {datos_leccion.tema}")
        
        # Guardar el tipo de lección en el JSON
        resultado_ia["tipo_curso"] = datos_leccion.tipo

        nueva_leccion = models.Leccion(
            ruta_id=datos_leccion.ruta_id,
            titulo=titulo_leccion,
            contenido_json=resultado_ia, # ¡Aquí guardamos toda la magia de la IA!
            orden=datos_leccion.orden
        )

        # 4. Guardar en la base de datos (PostgreSQL)
        db.add(nueva_leccion)
        db.commit()
        db.refresh(nueva_leccion)

        # 5. Devolver la lección guardada lista para que el frontend la muestre
        return nueva_leccion

    except Exception as e:
        db.rollback() # Si algo falla, cancelamos el guardado para no dañar la BD
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.post("/evaluar-ejercicio", tags=["Inteligencia Artificial"])
async def evaluar_ejercicio(
    evaluacion: schemas.EvaluacionEstudiante, 
    db: Session = Depends(get_db),
    usuario_actual = Depends(obtener_usuario_actual)
):
    """
    Recibe la respuesta del estudiante, la evalúa con IA y guarda el resultado.
    """
    try:
        # 1. Obtener la lección y la ruta para contexto
        leccion = db.query(models.Leccion).filter(models.Leccion.id == evaluacion.leccion_id).first()
        if not leccion:
            raise HTTPException(status_code=404, detail="Lección no encontrada")
            
        ruta = db.query(models.Ruta).filter(models.Ruta.id == leccion.ruta_id).first()
        tipo_curso = ruta.tipo if ruta else "Desarrollo de Software"
        
        # 2. Obtener el usuario de la DB y verificar que exista
        usuario_db = db.query(models.Usuario).filter(models.Usuario.email == usuario_actual.get("sub")).first()
        if not usuario_db:
            raise HTTPException(status_code=404, detail="Usuario no encontrado en la base de datos.")
        
        # 3. Llamar a Gemini para evaluar usando la llave del usuario si la tiene
        api_key = usuario_db.gemini_api_key or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API Key de Gemini no configurada.")
        resultado_ia = evaluar_respuesta_ia(
            api_key=api_key,
            respuesta_estudiante=evaluacion.respuesta,
            contexto_leccion=leccion.contenido_json,
            tipo_curso=tipo_curso
        )
        
        # 4. Guardar o actualizar progreso
        progreso = db.query(models.ProgresoCoder).filter(
            models.ProgresoCoder.usuario_id == usuario_db.id,
            models.ProgresoCoder.leccion_id == leccion.id
        ).first()
        
        estado = "Aprobado" if resultado_ia.get("calificacion", 0) >= 70 else "Reprobado"
        
        if progreso:
            progreso.respuesta_estudiante = evaluacion.respuesta
            progreso.calificacion_ia = resultado_ia.get("calificacion", 0)
            progreso.feedback_ia = resultado_ia.get("feedback", "Sin feedback")
            progreso.estado = estado
        else:
            progreso = models.ProgresoCoder(
                usuario_id=usuario_db.id,
                leccion_id=leccion.id,
                estado=estado,
                respuesta_estudiante=evaluacion.respuesta,
                calificacion_ia=resultado_ia.get("calificacion", 0),
                feedback_ia=resultado_ia.get("feedback", "Sin feedback")
            )
            db.add(progreso)
            
        db.commit()
        db.refresh(progreso)
        
        return {
            "status": "success",
            "resultado": resultado_ia,
            "estado": estado
        }
    except Exception as e:
        db.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al evaluar: {str(e)}")

@app.post("/tutor-chat", tags=["Inteligencia Artificial"])
async def chat_con_tutor(
    chat_req: schemas.ChatRequest,
    db: Session = Depends(get_db),
    usuario_actual = Depends(obtener_usuario_actual)
):
    """
    Recibe el historial de mensajes, recopila el progreso del estudiante y consulta a Gemini.
    """
    try:
        from gemini_service import chat_tutor_ia
        
        usuario_db = db.query(models.Usuario).filter(models.Usuario.email == usuario_actual.get("sub")).first()
        if not usuario_db:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
            
        api_key = usuario_db.gemini_api_key or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API Key no configurada")

        # 1. Obtener el progreso del estudiante
        progresos = db.query(models.ProgresoCoder).filter(
            models.ProgresoCoder.usuario_id == usuario_db.id
        ).all()
        
        # 2. Formatear el progreso para que la IA lo entienda
        historial_str = ""
        if not progresos:
            historial_str = "El estudiante es nuevo y aún no ha completado ninguna lección."
        else:
            historial_str = "Historial de lecciones del estudiante:\n"
            for p in progresos:
                leccion = db.query(models.Leccion).filter(models.Leccion.id == p.leccion_id).first()
                titulo = leccion.titulo if leccion else "Lección desconocida"
                historial_str += f"- Lección: {titulo} | Estado: {p.estado} | Nota: {p.calificacion_ia}/100 | Feedback previo IA: {p.feedback_ia}\n"
                
        # 3. Llamar al servicio de chat
        respuesta = chat_tutor_ia(api_key, chat_req.mensajes, historial_str)
        
        return {"respuesta": respuesta}
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error en el chat: {str(e)}")
    
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
    
# ==========================================
# RUTAS DE ESTUDIANTES / CODERS (FASE 4)
# ==========================================

@app.get("/lecciones", response_model=list[schemas.LeccionRespuestaIA], tags=["Lecciones"])
async def obtener_todas_las_lecciones(db: Session = Depends(get_db), usuario_actual = Depends(obtener_usuario_actual)):
    """
    Ventanilla para los Coders.
    Abre la bóveda, busca todas las lecciones guardadas y devuelve 
    el progreso del usuario para cada una de ellas.
    """
    usuario_db = db.query(models.Usuario).filter(models.Usuario.email == usuario_actual.get("sub")).first()
    
    lecciones = db.query(models.Leccion).order_by(models.Leccion.orden).all()
    
    # Mapear el progreso del usuario
    resultado = []
    for leccion in lecciones:
        progreso = None
        if usuario_db:
            progreso = db.query(models.ProgresoCoder).filter(
                models.ProgresoCoder.usuario_id == usuario_db.id,
                models.ProgresoCoder.leccion_id == leccion.id
            ).first()
            
        leccion_dict = {
            "id": leccion.id,
            "titulo": leccion.titulo,
            "contenido_json": leccion.contenido_json,
            "orden": leccion.orden,
            "estado": progreso.estado if progreso else "Pendiente",
            "calificacion_ia": progreso.calificacion_ia if progreso else None
        }
        resultado.append(leccion_dict)
    
    return resultado    

# ==========================================
# RUTAS DE ADMINISTRACIÓN
# ==========================================

@app.get("/admin/stats", tags=["Admin"])
async def obtener_estadisticas_admin(db: Session = Depends(get_db), usuario_actual = Depends(requerir_team_leader)):
    """
    Devuelve estadísticas en tiempo real para el panel de administración.
    """
    estudiantes_activos = db.query(models.Usuario).filter(models.Usuario.rol == 'CODER').count()
    lecciones_totales = db.query(models.Leccion).count()
    
    total_evaluaciones = db.query(models.ProgresoCoder).filter(
        models.ProgresoCoder.estado.in_(['Aprobado', 'Reprobado'])
    ).count()
    
    aprobados = db.query(models.ProgresoCoder).filter(
        models.ProgresoCoder.estado == 'Aprobado'
    ).count()
    
    tasa_aprobacion = 0
    if total_evaluaciones > 0:
        tasa_aprobacion = int((aprobados / total_evaluaciones) * 100)
        
    return {
        "estudiantes_activos": estudiantes_activos,
        "lecciones_totales": lecciones_totales,
        "tasa_aprobacion": tasa_aprobacion
    }