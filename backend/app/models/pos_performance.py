"""Mesures periodiques de performance d'un POS (Analytics)."""
import enum
from sqlalchemy import Column, Integer, ForeignKey, Date, DateTime, Numeric, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class SourcePerformance(str, enum.Enum):
    IMPORT = "IMPORT"
    CALCUL = "CALCUL"
    MANUEL = "MANUEL"


class POSPerformance(Base):
    __tablename__ = "pos_performance"

    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False, index=True)
    pos_id = Column(Integer, ForeignKey("pos.id"), nullable=False, index=True)

    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)

    clients_count = Column(Integer, default=0)
    active_sims_count = Column(Integer, default=0)
    performance_score = Column(Numeric(10, 2), nullable=True)
    source = Column(SAEnum(SourcePerformance), nullable=False, default=SourcePerformance.CALCUL)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    pos = relationship("POS")
