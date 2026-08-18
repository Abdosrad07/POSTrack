"""Ressources BTS et releves sous /api/partners/{partner_id}/bts."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, get_partner_context
from app.crud.bts_crud import bts_crud, bts_releve_crud
from app.models.user import User
from app.schemas.bts import BTSCreate, BTSOut, BTSReleveCreate, BTSReleveOut
from app.schemas.pagination import Page
from app.services.bts_service import create_bts as create_bts_service, get_bts_in_partner, add_releve
from app.services import audit_service

router = APIRouter(prefix="/api/partners/{partner_id}/bts", tags=["BTS"])


@router.get("", response_model=Page[BTSOut])
def list_bts(partner_id: int = Depends(get_partner_context), skip: int = 0,
             limit: int = Query(default=100, le=500),
             db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return bts_crud.list_paginated(db, skip=skip, limit=limit, partner_id=partner_id)


@router.post("", response_model=BTSOut, status_code=201)
def create_bts(payload: BTSCreate, partner_id: int = Depends(get_partner_context),
               db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return create_bts_service(db, partner_id=partner_id, user_id=user.id, data=payload.model_dump())


@router.get("/{bts_id}", response_model=BTSOut)
def get_bts(bts_id: int, partner_id: int = Depends(get_partner_context),
            db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return get_bts_in_partner(db, partner_id, bts_id)


@router.get("/{bts_id}/releves", response_model=Page[BTSReleveOut])
def list_releves(bts_id: int, partner_id: int = Depends(get_partner_context),
                  skip: int = 0, limit: int = Query(default=100, le=500),
                  db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    get_bts_in_partner(db, partner_id, bts_id)
    return bts_releve_crud.list_paginated(db, skip=skip, limit=limit, bts_id=bts_id)


@router.post("/{bts_id}/releves", response_model=BTSReleveOut, status_code=201)
def create_releve(bts_id: int, payload: BTSReleveCreate, partner_id: int = Depends(get_partner_context),
                   db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return add_releve(db, partner_id=partner_id, user_id=user.id, bts_id=bts_id, data=payload.model_dump())
