"""Ressources Clients sous /api/partners/{partner_id}/clients."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import NotFoundError
from app.api.deps import get_current_user, get_partner_context
from app.crud.client_crud import client_crud
from app.models.user import User
from app.schemas.client import ClientCreate, ClientUpdate, ClientOut
from app.schemas.pagination import Page
from app.services import audit_service

router = APIRouter(prefix="/api/partners/{partner_id}/clients", tags=["Clients"])


@router.get("", response_model=Page[ClientOut])
def list_clients(partner_id: int = Depends(get_partner_context), pos_id: int | None = None,
                  skip: int = 0, limit: int = Query(default=100, le=500),
                  db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return client_crud.list_paginated(db, skip=skip, limit=limit, partner_id=partner_id, pos_id=pos_id)


@router.post("", response_model=ClientOut, status_code=201)
def create_client(payload: ClientCreate, partner_id: int = Depends(get_partner_context),
                   db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    client = client_crud.create(db, {**payload.model_dump(), "partner_id": partner_id})
    audit_service.log_action(db, user_id=user.id, partner_id=partner_id, action="CLIENT_CREATE",
                              entity_type="CLIENT", entity_id=client.id)
    return client


@router.get("/{client_id}", response_model=ClientOut)
def get_client(client_id: int, partner_id: int = Depends(get_partner_context),
               db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    client = client_crud.get(db, client_id)
    if not client or client.partner_id != partner_id:
        raise NotFoundError("Client introuvable dans ce Partenaire.")
    return client


@router.patch("/{client_id}", response_model=ClientOut)
def update_client(client_id: int, payload: ClientUpdate, partner_id: int = Depends(get_partner_context),
                   db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    client = client_crud.get(db, client_id)
    if not client or client.partner_id != partner_id:
        raise NotFoundError("Client introuvable dans ce Partenaire.")
    return client_crud.update(db, client, payload.model_dump(exclude_unset=True))
