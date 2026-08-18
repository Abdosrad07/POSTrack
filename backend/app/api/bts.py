from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.bts import BTSCreate, BTSUpdate, BTSOut, BTSReleveCreate, BTSReleveOut, BTSReleveListOut
from app.crud import bts as crud
from app.services import bts_service
from app.security.permissions import require_role, MANAGER_PLUS, TOUS_ROLES

router = APIRouter()


@router.get("", response_model=list[BTSOut])
def list_bts(
    skip: int = 0,
    limit: int = 50,
    partenaire_id: int | None = None,
    statut: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TOUS_ROLES)),
):
    from app.services.access_scope import get_access_scope
    scope = get_access_scope(db, current_user)
    return crud.list_bts(
        db,
        skip=skip,
        limit=limit,
        partenaire_id=partenaire_id,
        statut=statut,
        bts_ids=scope.bts_ids,
        partenaire_ids=scope.partenaire_ids,
    )


@router.get("/releves", response_model=list[BTSReleveListOut])
def list_all_releves(
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TOUS_ROLES)),
):
    releves = crud.list_all_releves(db, skip=skip, limit=limit)
    from app.services.access_scope import get_access_scope
    scope = get_access_scope(db, current_user)
    if scope.bts_ids is not None:
        releves = [r for r in releves if r.bts_id in scope.bts_ids]
    return [
        BTSReleveListOut(
            id=r.id,
            bts_id=r.bts_id,
            bts_nom=r.bts.nom if r.bts else "",
            code=r.bts.code_bts if r.bts else "",
            charge=r.taux_saturation,
            debit=r.rendement,
            connexions=r.charge_mesuree,
            latence=None,
            statut=(r.bts.statut.value.lower() if r.bts else "actif"),
            date_releve=r.date_releve,
            rendement=r.rendement,
        )
        for r in releves
    ]


@router.get("/{bts_id}", response_model=BTSOut)
def get_bts(
    bts_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TOUS_ROLES)),
):
    from app.services.access_scope import get_access_scope
    scope = get_access_scope(db, current_user)
    if scope.bts_ids is not None and bts_id not in scope.bts_ids:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès non autorisé à cette BTS")

    bts = crud.get_bts(db, bts_id)
    if not bts:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="BTS introuvable")
    return bts



@router.post("", response_model=BTSOut, status_code=status.HTTP_201_CREATED)
def create_bts(
    data: BTSCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(MANAGER_PLUS)),
):
    if crud.get_bts_by_code(db, data.code_bts):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ce code_bts existe déjà")
    return crud.create_bts(db, data)


@router.put("/{bts_id}", response_model=BTSOut)
def update_bts(
    bts_id: int,
    data: BTSUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(MANAGER_PLUS)),
):
    bts = crud.get_bts(db, bts_id)
    if not bts:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="BTS introuvable")
    return crud.update_bts(db, bts, data)


@router.get("/{bts_id}/releves", response_model=list[BTSReleveOut])
def list_releves(
    bts_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TOUS_ROLES)),
):
    if not crud.get_bts(db, bts_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="BTS introuvable")
    return crud.list_releves(db, bts_id, skip=skip, limit=limit)


@router.post("/{bts_id}/releves", response_model=BTSReleveOut, status_code=status.HTTP_201_CREATED)
def ajouter_releve(
    bts_id: int,
    data: BTSReleveCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(MANAGER_PLUS)),
):
    bts = crud.get_bts(db, bts_id)
    if not bts:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="BTS introuvable")
    return bts_service.ajouter_releve(db, bts, data, created_by=current_user.id)
