from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database.connection import get_db

# Creamos la aplicación FastAPI
app = FastAPI(title="API de Vaharca")

# Ruta de prueba básica (Para ver si el servidor enciende)
@app.get("/")
def ruta_principal():
    return {"mensaje": "¡El servidor de Vaharca está encendido y funcionando!"}

# Ruta para probar que la base de datos se conectó correctamente
@app.get("/test-db")
def probar_base_datos(db: Session = Depends(get_db)):
    return {"mensaje": "¡Conexión a PostgreSQL en la base de datos vaharca_db exitosa!"}