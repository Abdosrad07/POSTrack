from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.prime import PrimeOut, PartenaireBrief
from app.crud import prime as crud
from app.security.permissions import require_role, TOUS_ROLES

router = APIRouter()


@router.get("", response_model=list[PrimeOut])
def list_primes(
    skip: int = 0,
    limit: int = 100,
    statut: str | None = None,
    partenaire_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TOUS_ROLES)),
):
    items = crud.list_primes(
        db,
        skip=skip,
        limit=limit,
        statut=statut or None,
        partenaire_id=partenaire_id,
    )
    result = []
    for p in items:
        out = PrimeOut.model_validate(p)
        if p.pos and p.pos.partenaire:
            out.partenaire = PartenaireBrief.model_validate(p.pos.partenaire)
        result.append(out)
    return result
