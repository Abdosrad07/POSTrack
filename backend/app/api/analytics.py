<<<<<<< HEAD
"""
Dashboard / Analytics sous /api/partners/{partner_id}/analytics.

Reprend les routes prevues par l'architecture technique v3.1-R7,
section 6.3 : GET .../analytics/overview (dashboard), GET
.../analytics/pos-performance et GET .../analytics/commissions.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, get_partner_context, require_roles
from app.crud.pos_crud import pos_performance_crud
from app.crud.prime_crud import dsm_commission_crud
from app.models.user import User
from app.security.permissions import Role
from app.schemas.analytics import DashboardOut
from app.schemas.pos_performance import POSPerformanceOut, POSPerformanceCalculateRequest
from app.schemas.prime import DSMCommissionOut
from app.schemas.pagination import Page
from app.services.analytics_service import get_dashboard, calculate_pos_performance

router = APIRouter(prefix="/api/partners/{partner_id}/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardOut)
def dashboard(partner_id: int = Depends(get_partner_context), db: Session = Depends(get_db),
              _user: User = Depends(get_current_user)):
    return get_dashboard(db, partner_id)


@router.get("/pos-performance", response_model=Page[POSPerformanceOut])
def list_pos_performance(partner_id: int = Depends(get_partner_context), pos_id: int | None = None,
                          skip: int = 0, limit: int = Query(default=100, le=500),
                          db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return pos_performance_crud.list_paginated(db, skip=skip, limit=limit, partner_id=partner_id, pos_id=pos_id)


@router.post("/pos-performance/calculate", response_model=list[POSPerformanceOut], status_code=201)
def calculate_pos_performance_route(payload: POSPerformanceCalculateRequest,
                                     partner_id: int = Depends(get_partner_context),
                                     db: Session = Depends(get_db),
                                     _user: User = Depends(require_roles(Role.ADMIN, Role.PARTENAIRE))):
    return calculate_pos_performance(
        db, partner_id=partner_id, period_start=payload.period_start, period_end=payload.period_end,
    )


@router.get("/commissions", response_model=Page[DSMCommissionOut])
def list_commissions(partner_id: int = Depends(get_partner_context), period_id: int | None = None,
                      skip: int = 0, limit: int = Query(default=100, le=500),
                      db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return dsm_commission_crud.list_paginated(db, skip=skip, limit=limit, partner_id=partner_id,
                                               prime_period_id=period_id)
=======
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
>>>>>>> origin/dev
