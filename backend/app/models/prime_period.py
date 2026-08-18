<<<<<<< HEAD
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
=======
from datetime import date
from sqlalchemy import String, Date, Enum, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.common import TimestampMixin
from app.models.enums import StatutPeriodePrime


class PrimePeriod(Base, TimestampMixin):
    """
    Période métier de prime (ex: Août 2026, T3 2026).
    Vol.1 section 1.6 R7 : une prime ne peut être créée que si la période est OUVERTE.
    """
    __tablename__ = "prime_periods"

    id: Mapped[int] = mapped_column(primary_key=True)
    libelle: Mapped[str] = mapped_column(String(100), nullable=False)
    date_debut: Mapped[date] = mapped_column(Date, nullable=False)
    date_fin: Mapped[date] = mapped_column(Date, nullable=False)
    statut: Mapped[StatutPeriodePrime] = mapped_column(
        Enum(StatutPeriodePrime), default=StatutPeriodePrime.OUVERTE, nullable=False
    )
    partenaire_id: Mapped[int] = mapped_column(ForeignKey("partenaires.id"), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    partenaire: Mapped["Partenaire"] = relationship(back_populates="prime_periods")
    primes: Mapped[list["Prime"]] = relationship(back_populates="period")
>>>>>>> origin/dev
