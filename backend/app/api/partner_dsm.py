"""Ressources DSM sous /api/partners/{partner_id}/dsm."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import NotFoundError
from app.api.deps import get_current_user, get_partner_context
from app.crud.partner_crud import dsm_crud
from app.models.user import User
from app.schemas.partner import DSMBase, DSMOut

router = APIRouter(prefix="/api/partners/{partner_id}/dsm", tags=["DSM"])


@router.get("", response_model=list[DSMOut])
def list_dsm(partner_id: int = Depends(get_partner_context),
             db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    """Liste des DSM du Partenaire courant (contexte verifie via X-Partner-Context-Id)."""
    return dsm_crud.list(db, partner_id=partner_id, limit=500)


@router.post("", response_model=DSMOut, status_code=201)
def create_dsm(payload: DSMBase, partner_id: int = Depends(get_partner_context),
               db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    """Creation d'un DSM rattache au Partenaire courant (partner_id force serveur)."""
    return dsm_crud.create(db, {**payload.model_dump(), "partner_id": partner_id})


@router.get("/{dsm_id}", response_model=DSMOut)
def get_dsm(dsm_id: int, partner_id: int = Depends(get_partner_context),
            db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    dsm = dsm_crud.get(db, dsm_id)
    if not dsm or getattr(dsm, "partner_id", None) != partner_id:
        raise NotFoundError("DSM introuvable dans ce Partenaire.")
    return dsm