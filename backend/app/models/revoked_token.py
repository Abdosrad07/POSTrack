"""
Jetons JWT revoques (logout). Une entree ici invalide immediatement le
jeton correspondant (identifie par son `jti`), meme s'il n'est pas
encore expire selon son horodatage `exp`.
"""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.core.database import Base


class RevokedToken(Base):
    __tablename__ = "revoked_tokens"

    id = Column(Integer, primary_key=True, index=True)
    jti = Column(String(64), unique=True, nullable=False, index=True)
    revoked_at = Column(DateTime(timezone=True), server_default=func.now())
