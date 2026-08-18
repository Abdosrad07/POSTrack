from datetime import datetime
from pydantic import BaseModel


class ClientCreate(BaseModel):
    pos_id: int
    full_name: str
    phone: str | None = None
    id_number: str | None = None


class ClientUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    id_number: str | None = None


class ClientOut(BaseModel):
    id: int
    partner_id: int
    pos_id: int
    full_name: str
    phone: str | None
    id_number: str | None
    created_at: datetime

    class Config:
        from_attributes = True
