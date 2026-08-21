from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.models.sim import StatutSim, TypeMouvementSim


class SIMCreate(BaseModel):
    pos_id: int
    iccid: str


class SIMStatusUpdate(BaseModel):
    status: StatutSim


class SIMOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    partner_id: int
    pos_id: int
    iccid: str
    status: StatutSim
    created_at: datetime


class SIMMovementCreate(BaseModel):
    movement_type: TypeMouvementSim
    comment: str | None = None


class SIMMovementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sim_id: int
    partner_id: int
    movement_type: TypeMouvementSim
    author_id: int
    comment: str | None
    created_at: datetime
