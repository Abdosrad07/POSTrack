"""Historique contractuel des POS (transition NOUVEAU -> RECONDUIT)."""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Reconduction(Base):
    __tablename__ = "reconductions"

    id = Column(Integer, primary_key=True, index=True)
    pos_id = Column(Integer, ForeignKey("pos.id"), nullable=False, index=True)

    old_expiration = Column(Date, nullable=False)
    new_expiration = Column(Date, nullable=False)
    motif = Column(Text, nullable=True)

    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    pos = relationship("POS", back_populates="reconductions")
    author = relationship("User")
