from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.pos import POSOut, POSListResponse
from app.crud import pos as crud
from app.security.permissions import require_role, TOUS_ROLES

router = APIRouter()


@router.get("", response_model=POSListResponse)
def list_pos(
    page: int = 1,
    limit: int = 20,
    search: str | None = None,
    statut: str | None = None,
    type: str | None = None,
    partenaire_id: int | None = None,
    dsm_id: int | None = None,
    region: str | None = None,
    sort_by: str = "date_creation",
    order: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TOUS_ROLES)),
):
    items, pagination = crud.list_pos(
        db,
        page=page,
        limit=limit,
        search=search or None,
        statut=statut or None,
        type_pos=type or None,
        partenaire_id=partenaire_id,
        dsm_id=dsm_id,
        region=region or None,
        sort_by=sort_by,
        order=order,
    )
    return POSListResponse(data=items, pagination=pagination)


@router.get("/{pos_id}", response_model=POSOut)
def get_pos(
    pos_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TOUS_ROLES)),
):
    pos = crud.get_pos(db, pos_id)
    if not pos:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="POS introuvable")
    return pos
