from datetime import datetime
from sqlalchemy import Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class BTSReleve(Base):
    """
    Un relevé = une mesure horodatée (Vol.1 §3.5).
    taux_saturation = charge_mesuree / capacite_max * 100, calculé côté service
    (bts_service.py), jamais saisi directement par le client.
    """
    __tablename__ = "bts_releves"

    id: Mapped[int] = mapped_column(primary_key=True)
    bts_id: Mapped[int] = mapped_column(ForeignKey("bts.id"), nullable=False)
    date_releve: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    charge_mesuree: Mapped[int] = mapped_column(Integer, nullable=False)
    taux_saturation: Mapped[float] = mapped_column(Float, nullable=True)  # calculé
    rendement: Mapped[float] = mapped_column(Float, nullable=True)
    remarque: Mapped[str] = mapped_column(Text, nullable=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    bts: Mapped["BTS"] = relationship(back_populates="releves")
