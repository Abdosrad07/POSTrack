"""Import Excel central sous /api/partners/{partner_id}/imports."""
import os

from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import NotFoundError
from app.api.deps import get_current_user, get_partner_context, require_roles
from app.crud.import_batch_crud import import_batch_crud
from app.models.user import User
from app.security.permissions import Role, IMPORT_ROLES
from app.schemas.import_batch import ImportBatchOut, ImportValidationResult
from app.schemas.pagination import Page
from app.services.import_validation_service import validate_import, apply_import

router = APIRouter(prefix="/api/partners/{partner_id}/imports", tags=["Import Excel"])


@router.post("/validate", response_model=ImportValidationResult)
async def validate_import_route(
    entity_type: str = Form(...),
    file: UploadFile = File(...),
    partner_id: int = Depends(get_partner_context),
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(*IMPORT_ROLES)),
):
    content = await file.read()
    return validate_import(
        db, partner_id=partner_id, user_id=user.id, entity_type=entity_type,
        filename=file.filename, file_bytes=content,
    )


@router.post("/{batch_id}/apply")
def apply_import_route(batch_id: int, partner_id: int = Depends(get_partner_context),
                        db: Session = Depends(get_db),
                        user: User = Depends(require_roles(*IMPORT_ROLES))):
    result = apply_import(db, partner_id=partner_id, user_id=user.id, batch_id=batch_id)
    return {"batch": ImportBatchOut.model_validate(result["batch"]), "applied_rows": result["applied_rows"]}


@router.get("/{batch_id}", response_model=ImportBatchOut)
def get_batch(batch_id: int, partner_id: int = Depends(get_partner_context),
              db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    from app.core.errors import NotFoundError
    batch = import_batch_crud.get(db, batch_id)
    if not batch or batch.partner_id != partner_id:
        raise NotFoundError("Lot d'import introuvable dans ce Partenaire.")
    return batch


@router.get("", response_model=Page[ImportBatchOut])
def list_batches(partner_id: int = Depends(get_partner_context),
                  skip: int = 0, limit: int = Query(default=100, le=500),
                  db: Session = Depends(get_db),
                  _user: User = Depends(get_current_user)):
    return import_batch_crud.list_paginated(db, skip=skip, limit=limit, partner_id=partner_id)


@router.get("/{batch_id}/report")
def download_error_report(batch_id: int, partner_id: int = Depends(get_partner_context),
                           db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    """Telecharge le rapport d'erreurs (JSON) d'un lot d'import donne."""
    batch = import_batch_crud.get(db, batch_id)
    if not batch or batch.partner_id != partner_id:
        raise NotFoundError("Lot d'import introuvable dans ce Partenaire.")
    if not batch.error_report_path or not os.path.exists(batch.error_report_path):
        raise NotFoundError("Rapport d'erreurs indisponible pour ce lot.")
    return FileResponse(
        batch.error_report_path,
        media_type="application/json",
        filename=f"rapport_erreurs_lot_{batch.id}.json",
    )
