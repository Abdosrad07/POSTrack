from datetime import date
from sqlalchemy import Numeric, Date, Enum, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.common import TimestampMixin
from app.models.enums import StatutPrime


class Prime(Base, TimestampMixin):
    """
    Vol.1 section 1.6.3 R7 — Cycle de vie étendu à 5 statuts :
      BROUILLON -> EN_ATTENTE -> VALIDEE -> PAYEE (ou REJETEE)
    Règles métier critiques :
      1. POS doit être type_pos == NOUVEAU (contrôle dans prime_service)
      2. La période PrimePeriod doit être OUVERTE (contrôle dans prime_service)
      3. Unicité par (pos_id, period_id) — contrainte DB
    """
    __tablename__ = "primes"
    __table_args__ = (
        UniqueConstraint("pos_id", "period_id", name="uq_prime_pos_period"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    pos_id: Mapped[int] = mapped_column(ForeignKey("pos.id"), nullable=False)
    period_id: Mapped[int] = mapped_column(ForeignKey("prime_periods.id"), nullable=False)
    dsm_id: Mapped[int] = mapped_column(ForeignKey("dsm.id"), nullable=True)
    partenaire_id: Mapped[int] = mapped_column(ForeignKey("partenaires.id"), nullable=True)
    montant: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    date_attribution: Mapped[date] = mapped_column(Date, nullable=False)
    statut: Mapped[StatutPrime] = mapped_column(
        Enum(StatutPrime), default=StatutPrime.BROUILLON, nullable=False
    )
    commentaire: Mapped[str] = mapped_column(Text, nullable=True)

    # Traçabilité des transitions de statut
    propose_par: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    valide_par: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    rejete_par: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)

    pos: Mapped["POS"] = relationship(back_populates="primes")
    period: Mapped["PrimePeriod"] = relationship(back_populates="primes")
    dsm_commission: Mapped["DSMCommission"] = relationship(back_populates="prime", uselist=False)
