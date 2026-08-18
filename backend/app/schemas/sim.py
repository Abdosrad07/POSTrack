from datetime import datetime
from pydantic import BaseModel

from app.models.sim import StatutSim, TypeMouvementSim


class SIMCreate(BaseModel):
    pos_id: int
    iccid: str


class SIMAssign(BaseModel):
    client_id: int


class SIMStatusUpdate(BaseModel):
    status: StatutSim


class SIMOut(BaseModel):
    id: int
    partner_id: int
    pos_id: int
    client_id: int | None
    iccid: str
    status: StatutSim
    created_at: datetime

    class Config:
        from_attributes = True


class SIMMovementCreate(BaseModel):
    movement_type: TypeMouvementSim
    comment: str | None = None


class SIMMovementOut(BaseModel):
    id: int
    sim_id: int
    partner_id: int
    movement_type: TypeMouvementSim
    author_id: int
    comment: str | None
    created_at: datetime

    class Config:
        from_attributes = True
