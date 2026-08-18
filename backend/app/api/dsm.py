from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.enums import RoleUser
from app.schemas.dsm import DSMCreate, DSMUpdate, DSMOut
from app.crud import dsm as crud
from app.security.permissions import require_role, MANAGER_PLUS, TOUS_ROLES

router = APIRouter()


@router.get("", response_model=list[DSMOut])
def list_dsm(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TOUS_ROLES)),
):
    from app.services.access_scope import get_visible_dsm_ids
    visible_ids = get_visible_dsm_ids(db, current_user)
    return crud.list_dsm(db, skip=skip, limit=limit, dsm_ids=visible_ids)


@router.get("/{dsm_id}", response_model=DSMOut)
def get_dsm(
    dsm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TOUS_ROLES)),
):
    dsm = crud.get_dsm(db, dsm_id)
    if not dsm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DSM introuvable")
    return dsm


@router.post("", response_model=DSMOut, status_code=status.HTTP_201_CREATED)
def create_dsm(
    data: DSMCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(MANAGER_PLUS)),
):
    if crud.get_dsm_by_matricule(db, data.matricule):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ce matricule existe déjà")
    return crud.create_dsm(db, data)


@router.put("/{dsm_id}", response_model=DSMOut)
def update_dsm(
    dsm_id: int,
    data: DSMUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(MANAGER_PLUS)),
):
    dsm = crud.get_dsm(db, dsm_id)
    if not dsm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DSM introuvable")
    return crud.update_dsm(db, dsm, data)


@router.delete("/{dsm_id}", response_model=DSMOut)
def deactivate_dsm(
    dsm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleUser.ADMIN])),
):
    """Désactive le DSM (statut=INACTIF) plutôt que de le supprimer physiquement."""
    dsm = crud.get_dsm(db, dsm_id)
    if not dsm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DSM introuvable")
    return crud.deactivate_dsm(db, dsm)
