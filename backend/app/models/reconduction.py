from datetime import date, datetime
from sqlalchemy import Date, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class Reconduction(Base):
    """
    Historise chaque reconduction d'un POS (Vol.1 section 3.3).
    Une ligne = un événement de renouvellement, jamais modifiée après coup.
    """
    __tablename__ = "reconductions"

    id: Mapped[int] = mapped_column(primary_key=True)
    pos_id: Mapped[int] = mapped_column(ForeignKey("pos.id"), nullable=False)
    date_reconduction: Mapped[date] = mapped_column(Date, nullable=False)
    ancienne_date_expiration: Mapped[date] = mapped_column(Date, nullable=False)
    nouvelle_date_expiration: Mapped[date] = mapped_column(Date, nullable=False)
    motif: Mapped[str] = mapped_column(Text, nullable=True)
    valide_par: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    pos: Mapped["POS"] = relationship(back_populates="reconductions")
