from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.pos import POS
from app.models.partenaire import Partenaire
from app.models.prime import Prime
from app.models.dsm import DSM
from app.models.bts import BTS
from app.models.client import Client
from app.models.enums import StatutPOS
from app.security.permissions import require_role, TOUS_ROLES

router = APIRouter()


@router.get("/dashboard")
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TOUS_ROLES)),
):
    return {
        "total_pos": db.query(POS).count(),
        "pos_actifs": db.query(POS).filter(POS.statut == StatutPOS.ACTIF).count(),
        "total_partenaires": db.query(Partenaire).count(),
        "total_dsm": db.query(DSM).count(),
        "total_bts": db.query(BTS).count(),
        "total_primes": db.query(Prime).count(),
        "total_clients": db.query(Client).count(),
    }
