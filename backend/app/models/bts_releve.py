"""Mesure horodatee de la charge, de la saturation et du rendement d'une BTS."""
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class BTSReleve(Base):
    __tablename__ = "bts_releves"

    id = Column(Integer, primary_key=True, index=True)
    bts_id = Column(Integer, ForeignKey("bts.id"), nullable=False, index=True)

    date_releve = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    charge = Column(Float, nullable=True)
    taux_saturation = Column(Float, nullable=True)
    rendement = Column(Float, nullable=True)
    commentaire = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    bts = relationship("BTS", back_populates="releves")
