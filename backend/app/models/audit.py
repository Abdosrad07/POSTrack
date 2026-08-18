"""Journal d'audit des operations sensibles (F-08)."""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.sql import func

from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=True)

    action = Column(String(100), nullable=False)          # ex: POS_CREATE, POS_RECONDUCTION, PRIME_VALIDATE
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
