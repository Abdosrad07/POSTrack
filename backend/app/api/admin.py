"""Écrans d'administration transverses (Partenaires, DSM, audit)."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import require_roles
from app.crud.partner_crud import partner_crud, dsm_crud
from app.models.user import User
from app.models.audit import AuditLog
from app.security.permissions import Role, ADMIN_SCREEN_ROLES
from app.schemas.partner import PartnerCreate, PartnerOut, DSMCreate, DSMOut
from app.services.dsm_identity_service import enrich_dsm_rows

router = APIRouter(prefix="/api/admin", tags=["Administration"])


@router.get("/partners", response_model=list[PartnerOut])
def list_partners(db: Session = Depends(get_db), _admin: User = Depends(require_roles(*ADMIN_SCREEN_ROLES))):
    from app.api.partenaires import _attach_pos_counts

    partners = partner_crud.list(db, limit=500)
    return _attach_pos_counts(db, partners)


@router.post("/partners", response_model=PartnerOut, status_code=201)
def create_partner(payload: PartnerCreate, db: Session = Depends(get_db),
                    _admin: User = Depends(require_roles(*ADMIN_SCREEN_ROLES))):
    return partner_crud.create(db, payload.model_dump())


@router.get("/dsm", response_model=list[DSMOut])
def list_dsm(partner_id: int | None = None, db: Session = Depends(get_db),
             _admin: User = Depends(require_roles(*ADMIN_SCREEN_ROLES))):
    return enrich_dsm_rows(db, dsm_crud.list(db, partner_id=partner_id, limit=500))


@router.post("/dsm", response_model=DSMOut, status_code=201)
def create_dsm(payload: DSMCreate, db: Session = Depends(get_db),
                _admin: User = Depends(require_roles(*ADMIN_SCREEN_ROLES))):
    dsm = dsm_crud.create(db, payload.model_dump())
    return enrich_dsm_rows(db, [dsm])[0]


@router.patch("/dsm/{dsm_id}/deactivate")
def deactivate_dsm(dsm_id: int, db: Session = Depends(get_db),
                    _admin: User = Depends(require_roles(*ADMIN_SCREEN_ROLES))):
    dsm = dsm_crud.get(db, dsm_id)
    if dsm:
        dsm.is_active = False if hasattr(dsm, "is_active") else dsm.is_active
        db.add(dsm)
        db.commit()
        db.refresh(dsm)
    return dsm


@router.post("/pos/{pos_id}/move-dsm")
def move_pos_between_dsm(pos_id: int, new_dsm_id: int, db: Session = Depends(get_db),
                          _admin: User = Depends(require_roles(*ADMIN_SCREEN_ROLES))):
    from app.crud.pos_crud import pos_crud
    pos = pos_crud.get(db, pos_id)
    if pos:
        pos.dsm_id = new_dsm_id
        db.add(pos)
        db.commit()
        db.refresh(pos)
    return pos


@router.get("/audit")
def list_audit(partner_id: int | None = None, skip: int = 0, limit: int = Query(default=100, le=500),
                db: Session = Depends(get_db), _admin: User = Depends(require_roles(Role.ADMIN))):
    query = db.query(AuditLog)
    if partner_id:
        query = query.filter(AuditLog.partner_id == partner_id)
    rows = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {"id": r.id, "user_id": r.user_id, "partner_id": r.partner_id, "action": r.action,
         "entity_type": r.entity_type, "entity_id": r.entity_id, "details": r.details,
         "created_at": r.created_at}
        for r in rows
    ]
