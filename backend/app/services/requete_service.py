"""
requete_service : gere les requetes multi-entites et leur traçabilite.
Verifie que toutes les entites rattachees appartiennent bien au
PartnerContext courant (regle F-05 / 6.4).

Le StatutRequete a ete retire : l'avancement d'une Requete est derive
des compteurs nombre_demande / nombre_effectue / nombre_rejete.
"""
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError, ValidationErrorApp
from app.crud.requete_crud import requete_crud, requete_entite_crud, requete_commentaire_crud
from app.models.requete import Requete
from app.models.pos import POS
from app.models.bts import BTS
from app.services import audit_service

ENTITY_MODELS = {"POS": POS, "BTS": BTS}


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


def _defaults(data: dict) -> dict:
    """Applique les valeurs par defaut des compteurs si absentes."""
    defaults = {
        "nombre_demande": 0,
        "nombre_effectue": 0,
        "nombre_rejete": 0,
    }
    for key, value in defaults.items():
        data.setdefault(key, value)
    if data.get("nombre_effectue", 0) + data.get("nombre_rejete", 0) >= data.get("nombre_demande", 0):
        if data.get("nombre_demande", 0) > 0 and not data.get("date_finalisation"):
            data["date_finalisation"] = datetime.now(timezone.utc)
    return data


def create_requete(db: Session, *, partner_id: int, user_id: int, data: dict) -> Requete:
    entites = data.pop("entites", [])
    for e in entites:
        _check_entity_in_partner(db, partner_id, e["entity_type"], e["entity_id"])

    if not data.get("date_creation"):
        data["date_creation"] = datetime.now(timezone.utc)
    data = _defaults(data)

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


def update_requete(db: Session, *, partner_id: int, user_id: int, requete_id: int, data: dict) -> Requete:
    """Met a jour les compteurs d'avancement d'une Requete.

    La finalisation est calculee automatiquement lorsque l'integralite
    des demandes a ete traitee (effectue + rejete == demande).
    """
    requete = get_requete_in_partner(db, partner_id, requete_id)

    commentaire = data.pop("commentaire", None)
    if commentaire:
        requete_commentaire_crud.create(db, {
            "requete_id": requete.id,
            "author_id": user_id,
            "commentaire": commentaire,
        })

    # Applique uniquement les champs fournis (nombre_effectue, nombre_rejete...)
    fields = {k: v for k, v in data.items() if v is not None}
    if fields:
        requete_crud.update(db, requete, fields)
        db.refresh(requete)

    # Finalisation derivee des compteurs (requete "ouverte" tant qu'il
    # reste des demandes non traitees).
    if (requete.nombre_effectue + requete.nombre_rejete >= requete.nombre_demande
            and requete.nombre_demande > 0 and requete.date_finalisation is None):
        requete.date_finalisation = datetime.now(timezone.utc)
        db.add(requete)
        db.commit()
        db.refresh(requete)

    audit_service.log_action(
        db, user_id=user_id, partner_id=partner_id, action="REQUETE_UPDATE",
        entity_type="REQUETE", entity_id=requete.id, details=f"Requete '{requete.titre}' mise a jour",
    )
    return requete
