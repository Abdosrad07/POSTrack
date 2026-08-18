"""
Initialisation du moteur SQLAlchemy et de la session.

Le projet cible MySQL en production (voir README) mais fonctionne aussi
directement avec SQLite pour le developpement et la demonstration, sans
installation supplementaire : il suffit de ne pas modifier DATABASE_URL
dans le fichier .env.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependance FastAPI fournissant une session DB par requete."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
