"""Ressources POS sous /api/partners/{partner_id}/pos."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, get_partner_context
from app.crud.pos_crud import pos_crud, reconduction_crud
from app.models.user import User
from app.models.pos import TypePos, StatutPos
from app.schemas.pos import (
    POSCreate, POSUpdate, POSOut, ReconductionCreate, ReconductionOut,
    POSLinkCreate, POSUnlinkCreate, POSLinkOut,
)
from app.schemas.pagination import Page
from app.services.pos_service import (
    create_pos, get_pos_in_partner, reconduire_pos,
    lier_detenteur, delier_detenteur, lister_liens,
)

router = APIRouter(prefix="/api/partners/{partner_id}/pos", tags=["POS"])


@router.get("", response_model=Page[POSOut])
def list_pos(
    partner_id: int = Depends(get_partner_context),
    type_pos: TypePos | None = None,
    status: StatutPos | None = None,
    dsm_id: int | None = None,
    skip: int = 0, limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    return pos_crud.list_paginated(db, skip=skip, limit=limit, partner_id=partner_id,
                                    type_pos=type_pos, status=status, dsm_id=dsm_id)


@router.post("", response_model=POSOut, status_code=201)
def create_pos_route(
    payload: POSCreate,
    partner_id: int = Depends(get_partner_context),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return create_pos(db, partner_id=partner_id, user_id=user.id, data=payload.model_dump())


@router.get("/{pos_id}", response_model=POSOut)
def get_pos(pos_id: int, partner_id: int = Depends(get_partner_context),
            db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return get_pos_in_partner(db, partner_id, pos_id)


@router.patch("/{pos_id}", response_model=POSOut)
def update_pos(pos_id: int, payload: POSUpdate, partner_id: int = Depends(get_partner_context),
               db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    pos = get_pos_in_partner(db, partner_id, pos_id)
    return pos_crud.update(db, pos, payload.model_dump(exclude_unset=True))


@router.post("/{pos_id}/reconduction", response_model=ReconductionOut, status_code=201)
def reconduction_route(pos_id: int, payload: ReconductionCreate,
                        partner_id: int = Depends(get_partner_context),
                        db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _pos, reconduction = reconduire_pos(
        db, partner_id=partner_id, user_id=user.id, pos_id=pos_id, data=payload.model_dump()
    )
    return reconduction


@router.get("/{pos_id}/reconductions", response_model=Page[ReconductionOut])
def list_reconductions(pos_id: int, partner_id: int = Depends(get_partner_context),
                       skip: int = 0, limit: int = Query(default=100, le=500),
                       db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    """Historique des reconductions d'un POS du Partenaire courant.

    Verifie d'abord que le POS appartient bien au PartnerContext (leve 404
    sinon), puis renvoie l'historique pagine de la table `reconductions`
    (ancienne/nouvelle date d'expiration, motif, validateur, horodatage).
    """
    get_pos_in_partner(db, partner_id, pos_id)
    return reconduction_crud.list_paginated(db, skip=skip, limit=limit, pos_id=pos_id)


@router.get("/{pos_id}/link", response_model=POSLinkOut)
def get_pos_link(pos_id: int, partner_id: int = Depends(get_partner_context),
                 db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    """Etat des liens Utilisateur <-> POS : detenteur courant + associations UserPOS."""
    return lister_liens(db, partner_id=partner_id, pos_id=pos_id)


@router.post("/{pos_id}/link", response_model=POSLinkOut, status_code=201)
def link_pos_route(pos_id: int, payload: POSLinkCreate,
                   partner_id: int = Depends(get_partner_context),
                   db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Link : designe un utilisateur detenteur du POS (holder_user_id + UserPOS)."""
    lier_detenteur(db, partner_id=partner_id, actor_id=user.id,
                   pos_id=pos_id, target_user_id=payload.user_id)
    return lister_liens(db, partner_id=partner_id, pos_id=pos_id)


@router.post("/{pos_id}/unlink", response_model=POSLinkOut)
def unlink_pos_route(pos_id: int, payload: POSUnlinkCreate,
                     partner_id: int = Depends(get_partner_context),
                     db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Unlink : retire le lien Utilisateur <-> POS (tout, ou l'utilisateur cible)."""
    delier_detenteur(db, partner_id=partner_id, actor_id=user.id,
                     pos_id=pos_id, target_user_id=payload.user_id)
    return lister_liens(db, partner_id=partner_id, pos_id=pos_id)
