from datetime import date, datetime
from pydantic import BaseModel

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


class POSUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    zone: str | None = None
    holder_user_id: int | None = None
    status: StatutPos | None = None


class POSOut(BaseModel):
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
    date_creation: date
    date_expiration: date
    date_derniere_reconduction: date | None
    created_at: datetime

    class Config:
        from_attributes = True


class ReconductionCreate(BaseModel):
    new_expiration: date
    motif: str | None = None


class ReconductionOut(BaseModel):
    id: int
    pos_id: int
    old_expiration: date
    new_expiration: date
    motif: str | None
    author_id: int
    created_at: datetime

    class Config:
        from_attributes = True
