from datetime import date, datetime
from pydantic import BaseModel, ConfigDict

from app.models.pos import TypePos, StatutPos


class POSCreate(BaseModel):
    code_pos: str
    name: str
    address: str | None = None
    zone: str | None = None
    dsm_id: int
    holder_user_id: int | None = None
    date_creation: date
    date_expiration: date
    stock_initial: int = 0
    stock_actuel: int | None = None


class POSUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    zone: str | None = None
    holder_user_id: int | None = None
    status: StatutPos | None = None
    stock_actuel: int | None = None


class POSOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code_pos: str
    name: str
    address: str | None
    zone: str | None
    partner_id: int
    dsm_id: int
    holder_user_id: int | None
    type_pos: TypePos
    status: StatutPos
    stock_initial: int
    stock_actuel: int
    donnees_additionnelles: dict | None = None
    date_creation: date
    date_expiration: date
    date_derniere_reconduction: date | None
    created_at: datetime


class ReconductionCreate(BaseModel):
    new_expiration: date
    motif: str | None = None


class ReconductionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    pos_id: int
    old_expiration: date
    new_expiration: date
    motif: str | None
    author_id: int
    created_at: datetime