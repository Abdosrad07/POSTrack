"""
requete_service : gere les requetes multi-entites et leur traçabilite.
Verifie que toutes les entites rattachees appartiennent bien au
PartnerContext courant (regle F-05 / 6.4).

Le StatutRequete a ete retire : l'avancement d'une Requete est derive
des compteurs nombre_demande / nombre_effectue / nombre_rejete.
"""
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.errors import NotFoundError, ValidationErrorApp
from app.crud.requete_crud import requete_crud, requete_entite_crud, requete_commentaire_crud
from app.models.requete import Requete
from app.models.pos import POS
from app.models.bts import BTS
from app.models.dsm import DSM
from app.models.user import User
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


def _calculate_request_status(requete: Requete) -> str:
    """Calcule le statut d'une requête : en cours ou terminée."""
    if requete.date_finalisation or (requete.nombre_effectue + requete.nombre_rejete >= requete.nombre_demande and requete.nombre_demande > 0):
        return "Terminée"
    return "En cours"


def _calculate_delay(requete: Requete) -> int | None:
    """Calcule le délai d'attente en jours entre création et fin."""
    if not requete.date_creation:
        return None

    def _as_utc(value: datetime) -> datetime:
        """Normalise naive/aware en UTC (SQLite relit des datetimes naive)."""
        return value.replace(tzinfo=timezone.utc) if value.tzinfo is None \
            else value.astimezone(timezone.utc)

    end_date = requete.date_finalisation or datetime.now(timezone.utc)
    return (_as_utc(end_date) - _as_utc(requete.date_creation)).days



def _is_late(requete: Requete) -> bool:
    """Détermine si une requête est en retard (délai > 7 jours pour les requêtes en cours)."""
    if requete.date_finalisation:
        return False  # Les requêtes terminées ne sont pas en retard
    if not requete.date_creation:
        return False
    if requete.delai:
        return _calculate_delay(requete) > requete.delai
    # Délai par défaut de 7 jours pour les requêtes en cours
    return _calculate_delay(requete) > 7


def enrich_requete_summary(db: Session, requete: Requete) -> dict:
    """Enrichit une requête avec les informations calculées pour l'affichage."""
    statut = _calculate_request_status(requete)
    delai_attente = _calculate_delay(requete)
    en_retard = _is_late(requete)
    
    # Récupérer le nom du DSM si associé
    dsm_name = None
    if requete.dsm_id:
        dsm = db.query(DSM).filter(DSM.id == requete.dsm_id).first()
        dsm_name = dsm.full_name or dsm.matricule if dsm else None
    
    # Récupérer le nom du demandeur
    demandeur_name = None
    if requete.demandeur_id:
        demandeur = db.query(User).filter(User.id == requete.demandeur_id).first()
        demandeur_name = demandeur.full_name if demandeur else None
    
    return {
        **requete.__dict__,
        'dsm_name': dsm_name,
        'demandeur_name': demandeur_name,
        'statut': statut,
        'en_retard': en_retard,
        'delai_attente': delai_attente,
    }


def get_requetes_by_dsm(db: Session, partner_id: int, dsm_id: int) -> list[Requete]:
    """Récupère les requêtes spécifiques à un DSM."""
    return db.query(Requete).filter(
        Requete.partner_id == partner_id,
        Requete.dsm_id == dsm_id
    ).order_by(Requete.created_at.desc()).all()


def get_dsm_request_summary(db: Session, partner_id: int, dsm_id: int) -> dict:
    """Calcule un résumé des requêtes pour un DSM spécifique."""
    requetes = get_requetes_by_dsm(db, partner_id, dsm_id)
    
    total = len(requetes)
    en_cours = sum(1 for r in requetes if _calculate_request_status(r) == "En cours")
    terminees = sum(1 for r in requetes if _calculate_request_status(r) == "Terminée")
    en_retard = sum(1 for r in requetes if _is_late(r))
    
    # Calcul de la progression
    progression = None
    if total > 0:
        progression = (terminees / total) * 100
    
    return {
        "total": total,
        "en_cours": en_cours,
        "terminees": terminees,
        "en_retard": en_retard,
        "progression": progression,
        "requetes": [enrich_requete_summary(db, r) for r in requetes],
    }
