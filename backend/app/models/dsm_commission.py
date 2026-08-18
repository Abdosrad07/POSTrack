from datetime import date
from sqlalchemy import Numeric, Date, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.common import TimestampMixin
from app.models.enums import StatutDSMCommission


class DSMCommission(Base, TimestampMixin):
    """
    Commission automatiquement générée pour le DSM lorsqu'une prime POS est validée.
    Vol.1 section 1.6 R7 (DSMCommission entity).
    Taux fixe : 5% du montant de la prime (configurable si besoin futur).
    """
    __tablename__ = "dsm_commissions"

    id: Mapped[int] = mapped_column(primary_key=True)
    prime_id: Mapped[int] = mapped_column(ForeignKey("primes.id"), unique=True, nullable=False)
    dsm_id: Mapped[int] = mapped_column(ForeignKey("dsm.id"), nullable=False)
    montant_commission: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    taux_commission: Mapped[float] = mapped_column(Numeric(5, 4), default=0.05, nullable=False)
    statut: Mapped[StatutDSMCommission] = mapped_column(
        Enum(StatutDSMCommission), default=StatutDSMCommission.EN_ATTENTE, nullable=False
    )
    date_versement: Mapped[date] = mapped_column(Date, nullable=True)
    note: Mapped[str] = mapped_column(String(500), nullable=True)

    prime: Mapped["Prime"] = relationship(back_populates="dsm_commission")
    dsm: Mapped["DSM"] = relationship(back_populates="commissions")
