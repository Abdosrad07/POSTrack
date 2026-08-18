from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel

from app.models.prime_period import StatutPeriode
from app.models.prime import StatutPrime
from app.models.dsm_commission import StatutCommission


class PrimePeriodCreate(BaseModel):
    code: str
    label: str
    start_date: date
    end_date: date


class PrimePeriodOut(BaseModel):
    id: int
    partner_id: int
    code: str
    label: str
    start_date: date
    end_date: date
    status: StatutPeriode
    created_at: datetime

    class Config:
        from_attributes = True


class PrimePeriodStatusUpdate(BaseModel):
    status: StatutPeriode


class PrimeOut(BaseModel):
    id: int
    pos_id: int
    prime_period_id: int
    montant: Decimal
    status: StatutPrime
    commentaire: str | None
    demandeur_id: int | None
    validated_by: int | None
    created_at: datetime

    class Config:
        from_attributes = True


class PrimeCalculateRequest(BaseModel):
    prime_period_id: int
    montant_fixe: Decimal = Decimal("50000.00")


class PrimeStatusUpdate(BaseModel):
    status: StatutPrime
    commentaire: str | None = None


class DSMCommissionOut(BaseModel):
    id: int
    partner_id: int
    dsm_id: int
    prime_period_id: int
    eligible_pos_count: int
    amount: Decimal
    status: StatutCommission

    class Config:
        from_attributes = True
