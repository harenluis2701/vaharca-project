# gemini_service.py
import google.generativeai as genai
import json
import traceback

def generar_leccion_ia(api_key: str, tema: str, nivel: str, tipo: str, idioma: str = "es"):
    """
    Genera una lección usando Gemini (SIEMPRE usa gemini-pro)
    """
    try:
        print(f"📝 Generando lección: {tema} - {nivel} - {tipo} - {idioma}")
        
        # Configurar Gemini
        genai.configure(api_key=api_key)
        

       # IMPORTANTE: Usar el modelo actualizado
        MODELO = 'gemini-flash-latest'
        print(f"🔍 Usando modelo: {MODELO}")
        
        model = genai.GenerativeModel(MODELO)
        
        idioma_instruccion = "en español" if idioma == "es" else "en inglés (pero las instrucciones y teoría pueden estar en español si lo ves más pedagógico para un estudiante hispanohablante, prioriza que el contenido a aprender sea en inglés)"

        prompt = f"""
        Eres un tutor experto de la plataforma educativa Vaharca. El enfoque es 70/30 (70% autoaprendizaje paso a paso, 30% mentoría).
        Genera una lección paso a paso sobre "{tema}" para nivel "{nivel}" en el área de "{tipo}".
        El contenido debe estar {idioma_instruccion}.
        
        IMPORTANTE: Responde SOLO con un objeto JSON válido, sin texto adicional.
        
        Formato EXACTO:
        {{
            "titulo": "Título atractivo de la lección",
            "teoria_breve": "Explicación concisa paso a paso y muy detallada del tema adaptada al nivel {nivel}, sin sobrecargar de información.",
            "preguntas_opcion_multiple": [
                {{
                    "id": 1,
                    "pregunta": "Pregunta para verificar la lectura de la teoría",
                    "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
                    "respuesta_correcta": "Opción A"
                }}
            ],
            "ejercicio_practico": "Instrucciones claras para que el estudiante aplique lo aprendido escribiendo código o texto en un recuadro. Debe ser un reto accionable."
        }}
        
        Asegúrate de que el JSON sea válido y tenga todas las llaves requeridas.
        """
        
        print("📤 Enviando petición a Gemini...")
        response = model.generate_content(prompt)
        
        print("📥 Respuesta recibida")
        
        # Limpiar la respuesta
        texto_respuesta = response.text.strip()
        
        # Quitar bloques de código si existen
        if texto_respuesta.startswith("```json"):
            texto_respuesta = texto_respuesta.split("```json")[1].split("```")[0].strip()
        elif texto_respuesta.startswith("```"):
            texto_respuesta = texto_respuesta.split("```")[1].split("```")[0].strip()
        
        # Parsear JSON
        try:
            datos = json.loads(texto_respuesta)
            print("✅ JSON parseado correctamente")
            return datos
        except json.JSONDecodeError as e:
            print(f"❌ Error parseando JSON: {e}")
            return {
                "error": "La IA no devolvió JSON válido",
                "detalle": str(e),
                "respuesta_cruda": texto_respuesta[:500]
            }
            
    except Exception as e:
        print(f"❌ Error: {type(e).__name__}: {e}")
        traceback.print_exc()
        return {
            "error": "Error al generar la lección",
            "detalle": str(e),
            "tipo_error": type(e).__name__
        }

def evaluar_respuesta_ia(api_key: str, respuesta_estudiante: str, contexto_leccion: dict, tipo_curso: str):
    """
    Evalúa la respuesta del estudiante basándose en el contexto de la lección.
    """
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-flash-latest')
        
        prompt = f"""
        Eres un evaluador de la plataforma Vaharca.
        El estudiante está en el curso de "{tipo_curso}".
        
        Contexto de la lección:
        - Título: {contexto_leccion.get('titulo')}
        - Ejercicio solicitado: {contexto_leccion.get('ejercicio_practico') or contexto_leccion.get('reto', 'No especificado')}
        
        Respuesta del estudiante:
        "{respuesta_estudiante}"
        
        Evalúa si el estudiante entendió el concepto y resolvió el ejercicio correctamente.
        Devuelve SOLO un objeto JSON válido con este formato:
        {{
            "calificacion": 100,
            "feedback": "Mensaje constructivo, amigable y directo explicando qué hizo bien y qué debe corregir."
        }}
        El campo calificacion debe ser un numero entero de 0 a 100.
        """
        response = model.generate_content(prompt)
        texto_respuesta = response.text.strip()
        
        if texto_respuesta.startswith("```json"):
            texto_respuesta = texto_respuesta.split("```json")[1].split("```")[0].strip()
        elif texto_respuesta.startswith("```"):
            texto_respuesta = texto_respuesta.split("```")[1].split("```")[0].strip()
            
        datos = json.loads(texto_respuesta)
        return datos
    except Exception as e:
        print(f"❌ Error al evaluar: {e}")
        return {
            "error": "No se pudo evaluar la respuesta.",
            "calificacion": 0,
            "feedback": f"Error del sistema: {str(e)}"
        }

def chat_tutor_ia(api_key: str, mensajes: list, progreso_estudiante: str):
    """
    Chat dinámico con el Tutor IA utilizando el historial del estudiante.
    """
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-flash-latest')
        
        system_instruction = f"""
        Eres el Tutor IA de la plataforma Vaharca.
        Tu objetivo es ayudar al estudiante a repasar y entender los conceptos en los que se ha equivocado.
        Sé amable, constructivo, y explica los conceptos de manera sencilla y con ejemplos de código cortos si aplica.

        Aquí está el historial de progreso del estudiante:
        {progreso_estudiante}

        Si el estudiante pregunta "en qué me equivoqué" o similar, analiza su progreso y explícale sus áreas de oportunidad.
        Si hace una pregunta general, respóndela usando tu conocimiento, pero teniendo en cuenta su nivel.
        """
        
        # Convertir mensajes al formato de Gemini
        history = []
        for msg in mensajes[:-1]:
            # Evitar mensajes nulos o vacíos
            if msg.content.strip():
                history.append({
                    "role": "user" if msg.role == "user" else "model",
                    "parts": [msg.content]
                })
        
        # El último mensaje es el actual del usuario
        ultimo_mensaje = mensajes[-1].content
        
        # Construimos el prompt combinando la instrucción del sistema y el último mensaje
        # Dado que Gemini Flash (a veces) no soporta system_instruction por separado en el SDK básico,
        # lo inyectamos al principio si es la primera interacción, o simplemente lo mandamos como contexto.
        if len(history) == 0:
            prompt_final = f"{system_instruction}\n\nPregunta del estudiante:\n{ultimo_mensaje}"
        else:
            prompt_final = f"[Contexto oculto del sistema: {system_instruction}]\n\n{ultimo_mensaje}"

        chat = model.start_chat(history=history)
        response = chat.send_message(prompt_final)
        
        return response.text
    except Exception as e:
        print(f"❌ Error en chat tutor: {e}")
        return f"Lo siento, tuve un problema interno al procesar tu solicitud. ({str(e)})"