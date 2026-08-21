"""DSM (District Sales Manager) : superviseur regional/local des POS."""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class DSM(Base):
    __tablename__ = "dsm"

    id = Column(Integer, primary_key=True, index=True)
    matricule = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(150), nullable=False)
    zone = Column(String(150), nullable=True)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False, index=True)
    partner = relationship("Partner")
    users = relationship("User", back_populates="dsm")