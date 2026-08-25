"""Carte d'identité partenaire (étape 5).

Agrège l'identité déclarative du Partner (responsable, commercial,
numéro MasterSIM) et les compteurs d'exploitation calculés côté backend
(micro-zones, POS créés / actifs, BTS). Le filtrage par Partenaire est
fait en amont par le PartnerContext dans la route ; ici on ne lit que
dans le périmètre du partenaire demandé.

Optimisation : compteurs SQL constants (4 COUNT), quel que soit le volume.
"""
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.models.bts import BTS
from app.models.partner import MicroZone, Partner
from app.models.pos import POS, StatutPos
from app.models.user import User


def get_partner_identity(db: Session, partner_id: int) -> dict:
    """Renvoie la fiche d'identité complète du partenaire demandé."""
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise NotFoundError("Partenaire introuvable.")

    def _username(user_id: int | None) -> str | None:
        if not user_id:
            return None
        return db.query(User.username).filter(User.id == user_id).scalar()

    nb_micro_zones = (
        db.query(func.count(MicroZone.id))
        .filter(MicroZone.partner_id == partner_id)
        .scalar() or 0
    )
    nb_pos_crees = (
        db.query(func.count(POS.id))
        .filter(POS.partner_id == partner_id)
        .scalar() or 0
    )
    nb_pos_actifs = (
        db.query(func.count(POS.id))
        .filter(POS.partner_id == partner_id, POS.status == StatutPos.ACTIF)
        .scalar() or 0
    )
    nb_bts = (
        db.query(func.count(BTS.id))
        .filter(BTS.partner_id == partner_id)
        .scalar() or 0
    )

    return {
        "id": partner.id,
        "code": partner.code,
        "name": partner.name,
        "address": partner.address,
        "is_active": bool(partner.is_active),
        "contract_start_date": partner.contract_start_date,
        "created_at": partner.created_at,
        "responsable_name": partner.responsable_name,
        "responsable_contact": partner.responsable_contact,
        "responsable_user_id": partner.responsable_user_id,
        "responsable_username": _username(partner.responsable_user_id),
        "commercial_name": partner.commercial_name,
        "commercial_contact": partner.commercial_contact,
        "commercial_user_id": partner.commercial_user_id,
        "commercial_username": _username(partner.commercial_user_id),
        "master_sim_number": partner.master_sim_number,
        "nb_micro_zones": nb_micro_zones,
        "nb_pos_crees": nb_pos_crees,
        "nb_pos_actifs": nb_pos_actifs,
        "nb_bts": nb_bts,
    }