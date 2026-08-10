"""
Connexion SQLAlchemy à MySQL.
Fournit : engine, SessionLocal (factory de sessions), Base (classe mère des modèles),
et get_db() — dépendance FastAPI standard pour injecter une session par requête.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

# pool_pre_ping=True : évite les erreurs "MySQL server has gone away" sur connexions
# inactives (utile dès qu'on a plusieurs devs qui laissent tourner le serveur longtemps).
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dépendance FastAPI : ouvre une session par requête, la ferme systématiquement."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
