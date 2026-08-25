"""Ressources BTS et releves sous /api/partners/{partner_id}/bts."""
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, get_partner_context, require_roles
from app.core.errors import ValidationErrorApp
from app.crud.bts_crud import bts_crud, bts_releve_crud
from app.models.bts import BTS
from app.models.bts_releve import BTSReleve
from app.models.partner import MicroZone
from app.models.user import User
from app.schemas.bts import BTSCreate, BTSOut, BTSReleveCreate, BTSReleveListOut, BTSReleveOut
from app.schemas.pagination import Page
from app.services.bts_service import create_bts as create_bts_service, get_bts_in_partner, add_releve
from app.services import audit_service
from app.services import bts_maps_service
from app.security.permissions import IMPORT_ROLES

router = APIRouter(prefix="/api/partners/{partner_id}/bts", tags=["BTS"])


def _bts_status(bts_id: int, last_releve: BTSReleve | None) -> str:
    """Statut derivé d'une BTS a partir de son dernier releve.

    - 'actif' si le dernier releve existe et n'est pas 'hors_service'.
    - 'hors_service' si le dernier releve est marque hors service.
    - 'inconnu' si aucun releve n'a ete enregistre.
    """
    if not last_releve:
        return "inconnu"
    return (last_releve.statut or "actif").lower()


def _nearest_microzone(bts: BTS, microzones: list[MicroZone]) -> MicroZone | None:
    """Associe une BTS a la micro-zone la plus proche (rayon 25 km).

    Les coordonnees reellement saisies cote BTS determinent la zone
    couverte ; on ne retourne rien si aucun point n'est exploitable.
    """
    if bts.latitude is None or bts.longitude is None or not microzones:
        return None
    best = None
    best_d2 = 25.0 ** 2  # ~25 km
    for mz in microzones:
        if mz.latitude is None or mz.longitude is None:
            continue
        d2 = (mz.latitude - bts.latitude) ** 2 + (mz.longitude - bts.longitude) ** 2
        if d2 <= best_d2:
            best_d2 = d2
            best = mz
    return best


@router.get("", response_model=Page[BTSOut])
def list_bts(partner_id: int = Depends(get_partner_context), skip: int = 0,
             limit: int = Query(default=100, le=500),
             db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    result = bts_crud.list_paginated(db, skip=skip, limit=limit, partner_id=partner_id)

    # Champs d'affichage pour les cartes/tableaux frontend :
    # - ville : alias metier de zone ;
    # - derniere_saturation : taux du releve le plus recent de la BTS.
    # - quartier / region : derives de zone
    # - micro_zone : rattachee par proximite (rayon 25 km)
    # - statut : derive du dernier releve
    microzones = db.query(MicroZone).filter(MicroZone.partner_id == partner_id).all()
    for bts in result.get("items", []):
        bts.ville = bts.zone
        bts.quartier = bts.zone
        bts.region = bts.zone
        mz = _nearest_microzone(bts, microzones)
        bts.micro_zone = mz.name if mz else None
        last = (
            db.query(BTSReleve)
            .filter(BTSReleve.bts_id == bts.id)
            .order_by(BTSReleve.date_releve.desc())
            .first()
        )
        bts.derniere_saturation = last.taux_saturation if last else None
        bts.saturation = last.taux_saturation if last else None
        bts.statut = _bts_status(bts.id, last)
        bts.saturation = last.taux_saturation if last else None
        bts.statut = _bts_status(bts.id, last)

    return result


@router.post("", response_model=BTSOut, status_code=201)
def create_bts(payload: BTSCreate, partner_id: int = Depends(get_partner_context),
               db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return create_bts_service(db, partner_id=partner_id, user_id=user.id, data=payload.model_dump())


@router.get("/releves", response_model=list[BTSReleveListOut])
def list_partner_releves(partner_id: int = Depends(get_partner_context),
                         db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    """Tous les relevés des BTS du Partenaire courant, denormalisés
    (bts_nom, code, charge, debit, connexions, latence, statut, date_releve, rendement)."""
    rows = (
        db.query(
            BTSReleve.id.label("id"),
            BTSReleve.bts_id.label("bts_id"),
            BTS.code_bts.label("bts_nom"),
            BTS.code_bts.label("code"),
            BTSReleve.charge.label("charge"),
            BTSReleve.debit.label("debit"),
            BTSReleve.connexions.label("connexions"),
            BTSReleve.latence.label("latence"),
            BTSReleve.statut.label("statut"),
            BTSReleve.date_releve.label("date_releve"),
            BTSReleve.rendement.label("rendement"),
        )
        .join(BTS, BTSReleve.bts_id == BTS.id)
        .filter(BTS.partner_id == partner_id)
        .order_by(BTSReleve.date_releve.desc())
        .all()
    )
    return [dict(r._mapping) for r in rows]


class _MapsImportPayload(BaseModel):
    filename: str


def _secure_import_path(partner_id: int, original_name: str) -> Path:
    uploads_dir = Path(__file__).resolve().parents[2] / "storage" / "bts_imports" / f"partner_{partner_id}"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    safe_name = Path(original_name).name
    return uploads_dir / f"{uuid4().hex}_{safe_name}"


@router.post("/import-maps")
async def store_bts_import_file(
    file: UploadFile = File(...),
    partner_id: int = Depends(get_partner_context),
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(*IMPORT_ROLES)),
):
    """Stocke un fichier interne sécurisé pour un import BTS futur.

    Le backend conserve uniquement le chemin serveur du fichier déposé.
    Aucun lien externe n'est accepté ici.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Nom de fichier manquant.")
    destination = _secure_import_path(partner_id, file.filename)
    content = await file.read()
    destination.write_bytes(content)
    try:
        partner = bts_maps_service.store_partner_import_file(
            db,
            partner_id=partner_id,
            file_path=str(destination),
            file_name=file.filename,
        )
    except ValidationErrorApp as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"partner_id": partner.id, "bts_import_file_path": partner.bts_import_file_path, "file_name": file.filename}


@router.get("/{bts_id}", response_model=BTSOut)
def get_bts(bts_id: int, partner_id: int = Depends(get_partner_context),
            db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return get_bts_in_partner(db, partner_id, bts_id)


@router.get("/{bts_id}/releves", response_model=Page[BTSReleveOut])
def list_releves(bts_id: int, partner_id: int = Depends(get_partner_context),
                  skip: int = 0, limit: int = Query(default=100, le=500),
                  db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    get_bts_in_partner(db, partner_id, bts_id)
    return bts_releve_crud.list_paginated(db, skip=skip, limit=limit, bts_id=bts_id)


@router.post("/{bts_id}/releves", response_model=BTSReleveOut, status_code=201)
def create_releve(bts_id: int, payload: BTSReleveCreate, partner_id: int = Depends(get_partner_context),
                   db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return add_releve(db, partner_id=partner_id, user_id=user.id, bts_id=bts_id, data=payload.model_dump())
