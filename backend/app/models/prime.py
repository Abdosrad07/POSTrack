from datetime import date
from sqlalchemy import Numeric, Date, Enum, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.common import TimestampMixin
from app.models.enums import StatutPrime


class Prime(Base, TimestampMixin):
    """
    Vol.1 section 3.4 : une Prime ne peut être créée que pour un POS type_pos == NOUVEAU
    (contrôle applicatif dans prime_service.py) ET pos_id est UNIQUE (contrôle DB) —
    un POS ne peut avoir qu'une seule Prime sur toute sa durée de vie.
    """
    __tablename__ = "primes"

    id: Mapped[int] = mapped_column(primary_key=True)
    pos_id: Mapped[int] = mapped_column(ForeignKey("pos.id"), unique=True, nullable=False)
    dsm_id: Mapped[int] = mapped_column(ForeignKey("dsm.id"), nullable=True)
    partenaire_id: Mapped[int] = mapped_column(ForeignKey("partenaires.id"), nullable=True)
    montant: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    date_attribution: Mapped[date] = mapped_column(Date, nullable=False)
    statut: Mapped[StatutPrime] = mapped_column(
        Enum(StatutPrime), default=StatutPrime.EN_ATTENTE, nullable=False
    )
    commentaire: Mapped[str] = mapped_column(Text, nullable=True)

    pos: Mapped["POS"] = relationship(back_populates="prime")
