"""
Regles metier POS : creation dans le PartnerContext courant et
transition NOUVEAU -> RECONDUIT (irreversible dans le cadre du MVP).
"""
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError, ValidationErrorApp
from app.crud.pos_crud import pos_crud, reconduction_crud, get_by_code_in_partner
from app.models.pos import POS, TypePos
from app.models.dsm import DSM
from app.services import audit_service


def create_pos(db: Session, *, partner_id: int, user_id: int, data: dict) -> POS:
    # Unicite du code POS dans le perimetre du Partenaire
    if get_by_code_in_partner(db, partner_id, data["code_pos"]):
        raise ConflictError(
            f"Le code POS '{data['code_pos']}' existe deja pour ce Partenaire.",
            field="code_pos",
        )

    # Le DSM doit appartenir au meme Partenaire (coherence indirecte)
    dsm = db.query(DSM).filter(DSM.id == data["dsm_id"], DSM.partner_id == partner_id).first()
    if not dsm:
        raise ValidationErrorApp("Le DSM indique n'appartient pas a ce Partenaire.", field="dsm_id")

    if data["date_expiration"] <= data["date_creation"]:
        raise ValidationErrorApp(
            "La date d'expiration doit etre posterieure a la date de creation.",
            field="date_expiration",
        )

    pos = pos_crud.create(db, {**data, "partner_id": partner_id, "type_pos": TypePos.NOUVEAU})

    audit_service.log_action(
        db, user_id=user_id, partner_id=partner_id, action="POS_CREATE",
        entity_type="POS", entity_id=pos.id,
        details=f"Creation du POS {pos.code_pos} (NOUVEAU)",
    )
    return pos


def get_pos_in_partner(db: Session, partner_id: int, pos_id: int) -> POS:
    pos = pos_crud.get(db, pos_id)
    if not pos or pos.partner_id != partner_id:
        raise NotFoundError("POS introuvable dans ce Partenaire.")
    return pos


def reconduire_pos(db: Session, *, partner_id: int, user_id: int, pos_id: int, data: dict):
    """
    Transition NOUVEAU -> RECONDUIT. Irreversible : rejette toute
    tentative sur un POS deja RECONDUIT ou avec une date incoherente.
    """
    pos = get_pos_in_partner(db, partner_id, pos_id)

    if pos.type_pos == TypePos.RECONDUIT:
        raise ConflictError("Ce POS a deja ete reconduit : operation irreversible.")

    if data["new_expiration"] <= pos.date_expiration:
        raise ValidationErrorApp(
            "La nouvelle date d'expiration doit etre posterieure a l'ancienne.",
            field="new_expiration",
        )

    reconduction = reconduction_crud.create(db, {
        "pos_id": pos.id,
        "old_expiration": pos.date_expiration,
        "new_expiration": data["new_expiration"],
        "motif": data.get("motif"),
        "author_id": user_id,
    })

    pos.date_expiration = data["new_expiration"]
    pos.date_derniere_reconduction = reconduction.created_at.date() if reconduction.created_at else data["new_expiration"]
    pos.type_pos = TypePos.RECONDUIT
    db.add(pos)
    db.commit()
    db.refresh(pos)

    audit_service.log_action(
        db, user_id=user_id, partner_id=partner_id, action="POS_RECONDUCTION",
        entity_type="POS", entity_id=pos.id,
        details=f"POS {pos.code_pos} passe a RECONDUIT (nouvelle expiration {data['new_expiration']})",
    )
    return pos, reconduction
