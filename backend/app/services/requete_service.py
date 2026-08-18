"""
requete_service : gere les requetes multi-entites, leurs statuts et
leur traçabilite. Verifie que toutes les entites rattachees
appartiennent bien au PartnerContext courant (regle F-05 / 6.4).
"""
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError, ValidationErrorApp
from app.crud.requete_crud import requete_crud, requete_entite_crud, requete_commentaire_crud
from app.models.requete import Requete, StatutRequete
from app.models.pos import POS
from app.models.bts import BTS
from app.models.client import Client
from app.services import audit_service

ENTITY_MODELS = {"POS": POS, "BTS": BTS, "CLIENT": Client}


def _check_entity_in_partner(db: Session, partner_id: int, entity_type: str, entity_id: int):
    entity_type = entity_type.upper()
    if entity_type == "PARTNER":
        if entity_id != partner_id:
            raise ValidationErrorApp("L'entite PARTNER referencee ne correspond pas au contexte courant.")
        return
    model = ENTITY_MODELS.get(entity_type)
    if not model:
        raise ValidationErrorApp(f"Type d'entite '{entity_type}' non supporte pour une Requete.")
    obj = db.query(model).filter(model.id == entity_id, model.partner_id == partner_id).first()
    if not obj:
        raise ValidationErrorApp(
            f"L'entite {entity_type}#{entity_id} n'appartient pas au Partenaire courant.",
        )


def create_requete(db: Session, *, partner_id: int, user_id: int, data: dict) -> Requete:
    entites = data.pop("entites", [])
    for e in entites:
        _check_entity_in_partner(db, partner_id, e["entity_type"], e["entity_id"])

    requete = requete_crud.create(db, {**data, "partner_id": partner_id, "demandeur_id": user_id})

    for e in entites:
        requete_entite_crud.create(db, {
            "requete_id": requete.id,
            "entity_type": e["entity_type"].upper(),
            "entity_id": e["entity_id"],
        })
    db.refresh(requete)

    audit_service.log_action(
        db, user_id=user_id, partner_id=partner_id, action="REQUETE_CREATE",
        entity_type="REQUETE", entity_id=requete.id, details=f"Requete '{requete.titre}' creee",
    )
    return requete


def get_requete_in_partner(db: Session, partner_id: int, requete_id: int) -> Requete:
    requete = requete_crud.get(db, requete_id)
    if not requete or requete.partner_id != partner_id:
        raise NotFoundError("Requete introuvable dans ce Partenaire.")
    return requete


def update_status(db: Session, *, partner_id: int, user_id: int, requete_id: int,
                   new_status: str, commentaire: str | None) -> Requete:
    requete = get_requete_in_partner(db, partner_id, requete_id)
    requete.statut = new_status
    if new_status in (StatutRequete.FERMEE.value, StatutRequete.REJETEE.value, StatutRequete.RESOLUE.value):
        requete.closed_at = datetime.now(timezone.utc)
    db.add(requete)
    db.commit()
    db.refresh(requete)

    requete_commentaire_crud.create(db, {
        "requete_id": requete.id,
        "author_id": user_id,
        "statut_apres": new_status,
        "commentaire": commentaire,
    })

    audit_service.log_action(
        db, user_id=user_id, partner_id=partner_id, action="REQUETE_STATUS_UPDATE",
        entity_type="REQUETE", entity_id=requete.id, details=f"Nouveau statut : {new_status}",
    )
    return requete
