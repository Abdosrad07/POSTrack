"""Client final enregistre au niveau d'un POS."""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Client(Base):
    __tablename__ = "clients"
    __table_args__ = (
        # Filtre le plus frequent du module Clients (liste des Clients
        # d'un POS donne, dans le contexte du Partenaire).
        Index("ix_client_partner_pos", "partner_id", "pos_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False, index=True)
    pos_id = Column(Integer, ForeignKey("pos.id"), nullable=False, index=True)

    full_name = Column(String(150), nullable=False)
    phone = Column(String(30), nullable=True)
    id_number = Column(String(50), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    pos = relationship("POS")
