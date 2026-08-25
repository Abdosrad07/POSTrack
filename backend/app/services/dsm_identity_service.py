"""Lecture d'identité DSM pour le contexte partenaire sélectionné."""
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.dsm import DSM
from app.models.pos import POS, TypePos


def get_dsm_identity(db: Session, *, partner_id: int, dsm_id: int) -> dict:
    dsm = db.query(DSM).filter(DSM.id == dsm_id, DSM.partner_id == partner_id).first()
    if not dsm:
        return None

    nb_pos_crees = db.query(func.count(POS.id)).filter(POS.partner_id == partner_id, POS.dsm_id == dsm_id).scalar() or 0

    return {
        "id": dsm.id,
        "matricule": dsm.matricule,
        "full_name": dsm.full_name,
        "zone": dsm.zone,
        "partner_id": dsm.partner_id,
        "nb_pos_crees": nb_pos_crees,
    }
