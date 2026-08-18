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
