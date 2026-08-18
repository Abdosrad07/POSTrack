"""Periode metier (mois/trimestre) servant a regrouper et controler les primes."""
import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Date, DateTime, Enum as SAEnum, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class StatutPeriode(str, enum.Enum):
    DRAFT = "DRAFT"
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    ARCHIVED = "ARCHIVED"


class PrimePeriod(Base):
    __tablename__ = "prime_periods"
    __table_args__ = (UniqueConstraint("partner_id", "code", name="uq_primeperiod_partner_code"),)

    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False, index=True)
    code = Column(String(50), nullable=False)
    label = Column(String(150), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(SAEnum(StatutPeriode), nullable=False, default=StatutPeriode.DRAFT)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    partner = relationship("Partner")
    primes = relationship("Prime", back_populates="prime_period")
