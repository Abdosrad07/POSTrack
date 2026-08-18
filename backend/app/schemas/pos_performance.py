from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel

from app.models.pos_performance import SourcePerformance


class POSPerformanceCalculateRequest(BaseModel):
    period_start: date
    period_end: date


class POSPerformanceOut(BaseModel):
    id: int
    partner_id: int
    pos_id: int
    period_start: date
    period_end: date
    clients_count: int
    active_sims_count: int
    performance_score: Decimal | None
    source: SourcePerformance
    created_at: datetime

    class Config:
        from_attributes = True
