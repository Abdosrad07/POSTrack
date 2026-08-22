"""Référentiel partenaires exposé sous /api/partenaires.

Complète /api/admin/partners (écran admin) et
/api/auth/partenaires/available (sélection de contexte) : c'est l'alias
utilisé par les pages métier du frontend (liste des partenaires,
formulaires POS/BTS/Primes qui proposent le choix du partenaire).

- GET  : tout utilisateur authentifié ; OPERATIONNEL ne voit que son
  partenaire assigné (aligné sur AccessScope v4).
- POST : réservé aux rôles des écrans d'administration (ADMIN).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, require_roles
from app.crud.partner_crud import partner_crud
from app.models.partner import Partner
from app.models.user import User
from app.schemas.partner import PartnerCreate, PartnerOut
from app.security.permissions import ADMIN_SCREEN_ROLES, Role

router = APIRouter(prefix="/api/partenaires", tags=["Partenaires"])


@router.get("", response_model=list[PartnerOut])
def list_partenaires(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Liste des partenaires actifs visibles par l'utilisateur connecté."""
    query = db.query(Partner).filter(Partner.is_active.is_(True))
    if user.role == Role.OPERATIONNEL:
        if not user.partner_id:
            return []
        query = query.filter(Partner.id == user.partner_id)
    return query.order_by(Partner.id).all()


@router.post("", response_model=PartnerOut, status_code=201)
def create_partenaire(
    payload: PartnerCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles(*ADMIN_SCREEN_ROLES)),
):
    """Création d'un partenaire (rôle ADMIN uniquement)."""
    return partner_crud.create(db, payload.model_dump())