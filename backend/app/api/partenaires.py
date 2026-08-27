"""Référentiel partenaires exposé sous /api/partenaires.

Complète /api/admin/partners (écran admin) et
/api/auth/partenaires/available (sélection de contexte) : c'est l'alias
utilisé par les pages métier du frontend (liste des partenaires,
formulaires POS/BTS/Primes qui proposent le choix du partenaire).

- GET  : tout utilisateur authentifié ; OPERATIONNEL ne voit que son
  partenaire assigné (aligné sur AccessScope v4).
- POST : réservé aux rôles des écrans d'administration (ADMIN).
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, require_roles, get_partner_context
from app.crud.partner_crud import partner_crud
from app.models.partner import Partner
from app.models.pos import POS
from app.models.user import User
from app.schemas.partner import PartnerCreate, PartnerIdentityOut, PartnerOut
from app.security.permissions import ADMIN_SCREEN_ROLES, Role
from app.services.partner_identity_service import get_partner_identity

router = APIRouter(prefix="/api/partenaires", tags=["Partenaires"])


def _attach_pos_counts(db: Session, partners: list[Partner]) -> list[Partner]:
    """Renseigne partner.pos_count via UNE requete GROUP BY (pas de N+1)."""
    if not partners:
        return partners
    counts = dict(
        db.query(POS.partner_id, func.count(POS.id))
        .filter(POS.partner_id.in_([p.id for p in partners]))
        .group_by(POS.partner_id)
        .all()
    )
    for partner in partners:
        partner.pos_count = int(counts.get(partner.id, 0))
    return partners


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
    partners = query.order_by(Partner.id).all()
    return _attach_pos_counts(db, partners)


@router.get("/{partner_id}", response_model=PartnerOut)
def get_partenaire(partner_id: int = Depends(get_partner_context),
                   db: Session = Depends(get_db),
                   _user: User = Depends(get_current_user)):
    """Détail du partenaire courant (inclut bts_map_url — v3.4 §2.6).

    L'accès est scopé au PartnerContext : un utilisateur ne peut lire
    que le partenaire de son périmètre.
    """
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partenaire introuvable.")
    _attach_pos_counts(db, [partner])
    return partner


@router.get("/{partner_id}/identity", response_model=PartnerIdentityOut)
def get_partenaire_identity(partner_id: int = Depends(get_partner_context),
                            db: Session = Depends(get_db),
                            _user: User = Depends(get_current_user)):
    """Carte d'identité du partenaire courant (étape 5).

    Identité déclarative + compteurs d'exploitation calculés côté backend
    (micro-zones, POS créés/actifs, BTS). Accès scopé au PartnerContext :
    un utilisateur ne peut lire que l'identité de son périmètre.
    """
    return get_partner_identity(db, partner_id)


@router.post("", response_model=PartnerOut, status_code=201)
def create_partenaire(
    payload: PartnerCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles(*ADMIN_SCREEN_ROLES)),
):
    """Création d'un partenaire (rôle ADMIN uniquement)."""
    return partner_crud.create(db, payload.model_dump())