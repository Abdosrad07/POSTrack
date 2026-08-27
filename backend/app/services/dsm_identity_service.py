"""Lecture d'identité DSM pour le contexte partenaire sélectionné."""
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.dsm import DSM
from app.models.partner import Partner
from app.models.pos import POS, TypePos


def enrich_dsm_rows(db: Session, dsms: list[DSM]) -> list[DSM]:
    """Renseigne partner_name + nb_pos_crees sur une liste de DSM.

    Deux requetes GROUP BY au total (jamais une requete par ligne — cf.
    ROADMAP.md) : les tableaux frontend affichent ainsi toutes les
    colonnes attendues sans N+1.
    """
    if not dsms:
        return dsms
    dsm_ids = [d.id for d in dsms]
    pos_counts = dict(
        db.query(POS.dsm_id, func.count(POS.id))
        .filter(POS.dsm_id.in_(dsm_ids))
        .group_by(POS.dsm_id)
        .all()
    )
    partner_ids = {d.partner_id for d in dsms}
    partner_names = (
        dict(db.query(Partner.id, Partner.name).filter(Partner.id.in_(partner_ids)).all())
        if partner_ids
        else {}
    )
    for dsm in dsms:
        dsm.nb_pos_crees = int(pos_counts.get(dsm.id, 0))
        dsm.partner_name = partner_names.get(dsm.partner_id)
    return dsms


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
