"""Requetes multi-entites sous /api/partners/{partner_id}/requests."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, get_partner_context
from app.crud.requete_crud import requete_crud
from app.models.user import User
from app.schemas.requete import RequeteCreate, RequeteStatusUpdate, RequeteOut
from app.schemas.pagination import Page
from app.services.requete_service import create_requete, get_requete_in_partner, update_status

router = APIRouter(prefix="/api/partners/{partner_id}/requests", tags=["Requetes"])


@router.get("", response_model=Page[RequeteOut])
def list_requests(partner_id: int = Depends(get_partner_context), statut: str | None = None,
                   skip: int = 0, limit: int = Query(default=100, le=500),
                   db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return requete_crud.list_paginated(db, skip=skip, limit=limit, partner_id=partner_id, statut=statut)


@router.post("", response_model=RequeteOut, status_code=201)
def create_request(payload: RequeteCreate, partner_id: int = Depends(get_partner_context),
                    db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return create_requete(db, partner_id=partner_id, user_id=user.id, data=payload.model_dump())


@router.get("/{request_id}", response_model=RequeteOut)
def get_request(request_id: int, partner_id: int = Depends(get_partner_context),
                 db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return get_requete_in_partner(db, partner_id, request_id)


@router.patch("/{request_id}", response_model=RequeteOut)
def update_request_status(request_id: int, payload: RequeteStatusUpdate,
                           partner_id: int = Depends(get_partner_context),
                           db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return update_status(db, partner_id=partner_id, user_id=user.id, requete_id=request_id,
                          new_status=payload.statut.value, commentaire=payload.commentaire)
