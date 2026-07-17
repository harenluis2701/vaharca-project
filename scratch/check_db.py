import sys
sys.path.append('.')
from database.connection import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        # Drop constraint
        print("Dropping old constraint...")
        try:
            conn.execute(text("ALTER TABLE progreso_coder DROP CONSTRAINT progreso_coder_estado_check;"))
            print("Dropped.")
        except Exception as e:
            print("Error dropping constraint:", e)
        
        # Add new constraint
        print("Adding new constraint...")
        try:
            conn.execute(text("ALTER TABLE progreso_coder ADD CONSTRAINT progreso_coder_estado_check CHECK (estado IN ('Pendiente', 'Completada', 'Aprobado', 'Reprobado'));"))
            print("Added.")
        except Exception as e:
            print("Error adding constraint:", e)
        
        conn.commit()

if __name__ == '__main__':
    migrate()
