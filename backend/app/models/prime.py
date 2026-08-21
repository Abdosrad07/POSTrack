"""Dossier de prime lie a un POS Nouveau et a une PrimePeriod."""
import enum
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Numeric, Text, Enum as SAEnum, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class StatutPrime(str, enum.Enum):
    BROUILLON = "BROUILLON"
    EN_ATTENTE = "EN_ATTENTE"
    VALIDEE = "VALIDEE"
    PAYEE = "PAYEE"
    REJETEE = "REJETEE"


class Prime(Base):
    __tablename__ = "primes"
    # Un POS ne peut recevoir qu'une seule prime de creation (regle d'unicite)
    __table_args__ = (UniqueConstraint("pos_id", name="uq_prime_pos_unique"),)

    id = Column(Integer, primary_key=True, index=True)
    pos_id = Column(Integer, ForeignKey("pos.id"), nullable=False, index=True)
    prime_period_id = Column(Integer, ForeignKey("prime_periods.id"), nullable=False, index=True)

    montant = Column(Numeric(12, 2), nullable=False)
    status = Column(SAEnum(StatutPrime), nullable=False, default=StatutPrime.EN_ATTENTE)
    commentaire = Column(Text, nullable=True)

    demandeur_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    validated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    validated_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    pos = relationship("POS", back_populates="primes")
    prime_period = relationship("PrimePeriod", back_populates="primes")
