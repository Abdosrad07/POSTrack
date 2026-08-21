"""Commission ou quote-part suivie pour un DSM au titre d'une periode de primes."""
import enum
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Numeric, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class StatutCommission(str, enum.Enum):
    DRAFT = "DRAFT"
    CALCULATED = "CALCULATED"
    VALIDATED = "VALIDATED"
    PAID = "PAID"
    REJECTED = "REJECTED"


class DSMCommission(Base):
    __tablename__ = "dsm_commissions"

    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False, index=True)
    dsm_id = Column(Integer, ForeignKey("dsm.id"), nullable=False, index=True)
    prime_period_id = Column(Integer, ForeignKey("prime_periods.id"), nullable=False, index=True)

    eligible_pos_count = Column(Integer, default=0)
    amount = Column(Numeric(12, 2), nullable=False, default=0)
    status = Column(SAEnum(StatutCommission), nullable=False, default=StatutCommission.DRAFT)

    calculated_at = Column(DateTime(timezone=True), nullable=True)
    validated_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    dsm = relationship("DSM")
    prime_period = relationship("PrimePeriod")
