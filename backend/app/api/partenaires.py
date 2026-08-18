from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.partenaire import PartenaireCreate, PartenaireUpdate, PartenaireOut
from app.crud import partenaire as crud
from app.security.permissions import require_role, get_current_user, MANAGER_PLUS, TOUS_ROLES
from app.models.enums import RoleUser

router = APIRouter()


@router.get("", response_model=list[PartenaireOut])
def list_partenaires(
    skip: int = 0,
    limit: int = 50,
    statut: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TOUS_ROLES)),
):
    # Filtre selon la portée d'accès de l'utilisateur
    from app.services.access_scope import get_visible_partenaire_ids
    visible_ids = get_visible_partenaire_ids(db, current_user)
    return crud.list_partenaires(
        db, skip=skip, limit=limit, statut=statut, partenaire_ids=visible_ids
    )


@router.get("/available", response_model=list[PartenaireOut])
def list_available_partenaires(
    statut: str | None = Query(default="ACTIF"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TOUS_ROLES)),
):
    """Retourne les partenaires visibles/utilisables par l'utilisateur connecté."""
    from app.services.access_scope import get_visible_partenaire_ids

    visible_ids = get_visible_partenaire_ids(db, current_user)
    return crud.list_partenaires(
        db,
        skip=0,
        limit=100,
        statut=statut,
        partenaire_ids=visible_ids,
    )


@router.get("/{partenaire_id}", response_model=PartenaireOut)
def get_partenaire(
    partenaire_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TOUS_ROLES)),
):
    partenaire = crud.get_partenaire(db, partenaire_id)
    if not partenaire:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partenaire introuvable")
    return partenaire


@router.post("", response_model=PartenaireOut, status_code=status.HTTP_201_CREATED)
def create_partenaire(
    data: PartenaireCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(MANAGER_PLUS)),
):
    if crud.get_partenaire_by_code(db, data.code_partenaire):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ce code_partenaire existe déjà",
        )
    return crud.create_partenaire(db, data, created_by=current_user.id)


@router.put("/{partenaire_id}", response_model=PartenaireOut)
def update_partenaire(
    partenaire_id: int,
    data: PartenaireUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(MANAGER_PLUS)),
):
    partenaire = crud.get_partenaire(db, partenaire_id)
    if not partenaire:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partenaire introuvable")
    return crud.update_partenaire(db, partenaire, data)


@router.delete("/{partenaire_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_partenaire(
    partenaire_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([RoleUser.ADMIN])),
):
    partenaire = crud.get_partenaire(db, partenaire_id)
    if not partenaire:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partenaire introuvable")
    crud.delete_partenaire(db, partenaire)
