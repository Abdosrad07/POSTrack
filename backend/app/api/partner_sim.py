"""Ressources SIM sous /api/partners/{partner_id}/sim."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, get_partner_context
from app.crud.sim_crud import sim_crud, sim_movement_crud
from app.models.user import User
from app.schemas.sim import SIMCreate, SIMStatusUpdate, SIMOut, SIMMovementCreate, SIMMovementOut
from app.schemas.pagination import Page
from app.services.sim_service import create_sim, update_status, record_movement, get_sim_in_partner

router = APIRouter(prefix="/api/partners/{partner_id}/sim", tags=["SIM"])


@router.get("", response_model=Page[SIMOut])
def list_sim(partner_id: int = Depends(get_partner_context), pos_id: int | None = None,
             status: str | None = None, skip: int = 0, limit: int = Query(default=100, le=500),
             db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return sim_crud.list_paginated(db, skip=skip, limit=limit, partner_id=partner_id, pos_id=pos_id, status=status)


@router.post("", response_model=SIMOut, status_code=201)
def create_sim_route(payload: SIMCreate, partner_id: int = Depends(get_partner_context),
                      db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return create_sim(db, partner_id=partner_id, user_id=user.id, data=payload.model_dump())


@router.patch("/{sim_id}/status", response_model=SIMOut)
def update_sim_status(sim_id: int, payload: SIMStatusUpdate, partner_id: int = Depends(get_partner_context),
                       db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return update_status(db, partner_id=partner_id, user_id=user.id, sim_id=sim_id, status=payload.status.value)


@router.post("/{sim_id}/movements", response_model=SIMMovementOut, status_code=201)
def create_sim_movement(sim_id: int, payload: SIMMovementCreate, partner_id: int = Depends(get_partner_context),
                         db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Enregistre un mouvement de stock (reception, vente, activation, retour, perte)."""
    return record_movement(db, partner_id=partner_id, user_id=user.id, sim_id=sim_id,
                            movement_type=payload.movement_type.value, comment=payload.comment)


@router.get("/{sim_id}/movements", response_model=Page[SIMMovementOut])
def list_sim_movements(sim_id: int, partner_id: int = Depends(get_partner_context),
                        skip: int = 0, limit: int = Query(default=100, le=500),
                        db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    get_sim_in_partner(db, partner_id, sim_id)
    return sim_movement_crud.list_paginated(db, skip=skip, limit=limit, sim_id=sim_id)
