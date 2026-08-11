"""
Connexion SQLAlchemy à SQLite.
Fournit : engine, SessionLocal (factory de sessions), Base (classe mère des modèles),
et get_db() — dépendance FastAPI standard pour injecter une session par requête.
"""
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine import Engine

from app.config import settings

# check_same_thread=False : SQLite refuse par défaut qu'une connexion soit utilisée
# par un autre thread que celui qui l'a ouverte. FastAPI/Starlette peut traiter les
# requêtes sur plusieurs threads (endpoints sync) — sans cette option, on obtient
# une erreur "SQLite objects created in a thread can only be used in that same thread".
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=settings.DEBUG,
)


@event.listens_for(Engine, "connect")
def _enable_sqlite_foreign_keys(dbapi_connection, connection_record):
    """
    SQLite n'applique PAS les contraintes de clé étrangère par défaut, même si
    elles sont déclarées dans les modèles (ex: Prime.pos_id -> pos.id). Sans ce
    PRAGMA, une insertion avec un pos_id inexistant serait acceptée silencieusement.
    """
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dépendance FastAPI : ouvre une session par requête, la ferme systématiquement."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
