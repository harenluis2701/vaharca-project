from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

# Esta es la clase base de la que heredarán todos nuestros modelos
Base = declarative_base()

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(20), nullable=False) 
    fecha_registro = Column(DateTime, default=datetime.utcnow)

    # Relaciones con otras tablas
    rutas = relationship("Ruta", back_populates="creador")
    progresos = relationship("ProgresoCoder", back_populates="usuario")

class Ruta(Base):
    __tablename__ = "rutas"
    
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(150), nullable=False)
    nivel = Column(String(50), nullable=False)
    tipo = Column(String(50), nullable=False)
    estado = Column(String(20), default="Borrador")
    creado_por = Column(Integer, ForeignKey("usuarios.id"))

    creador = relationship("Usuario", back_populates="rutas")
    lecciones = relationship("Leccion", back_populates="ruta", cascade="all, delete-orphan")

class Leccion(Base):
    __tablename__ = "lecciones"
    
    id = Column(Integer, primary_key=True, index=True)
    ruta_id = Column(Integer, ForeignKey("rutas.id", ondelete="CASCADE"))
    titulo = Column(String(150), nullable=False)
    contenido_json = Column(JSON, nullable=False)
    orden = Column(Integer, nullable=False)

    ruta = relationship("Ruta", back_populates="lecciones")
    progresos = relationship("ProgresoCoder", back_populates="leccion", cascade="all, delete-orphan")

class ProgresoCoder(Base):
    __tablename__ = "progreso_coder"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"))
    leccion_id = Column(Integer, ForeignKey("lecciones.id", ondelete="CASCADE"))
    estado = Column(String(20), default="Pendiente")
    feedback_ia = Column(String)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="progresos")
    leccion = relationship("Leccion", back_populates="progresos")