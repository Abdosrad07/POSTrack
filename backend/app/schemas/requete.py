from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.models.requete import TypeRequete, PrioriteRequete


class RequeteEntiteIn(BaseModel):
    entity_type: str   # POS, BTS, PARTNER
    entity_id: int


class RequeteCreate(BaseModel):
    type_requete: TypeRequete
    titre: str
    description: str | None = None
    priorite: PrioriteRequete = PrioriteRequete.NORMALE
    responsable_id: int | None = None
    dsm_id: int | None = None  # DSM demandeur
    nombre_demande: int = 1
    nombre_effectue: int = 0
    nombre_rejete: int = 0
    entite_en_charge: str | None = None
    entites: list[RequeteEntiteIn] = []


class RequeteUpdate(BaseModel):
    """Mise a jour des compteurs et de la finalisation d'une Requete."""
    nombre_demande: int | None = None
    nombre_effectue: int | None = None
    nombre_rejete: int | None = None
    delai: int | None = None
    date_finalisation: datetime | None = None
    commentaire: str | None = None


class RequeteEntiteOut(BaseModel):
    entity_type: str
    entity_id: int

    model_config = ConfigDict(from_attributes=True)


class RequeteCommentaireOut(BaseModel):
    id: int
    author_id: int
    commentaire: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RequeteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    partner_id: int
    dsm_id: int | None = None  # DSM demandeur
    type_requete: TypeRequete
    titre: str
    description: str | None
    priorite: PrioriteRequete
    date_creation: datetime | None
    nombre_demande: int
    nombre_effectue: int
    nombre_rejete: int
    delai: int | None
    date_finalisation: datetime | None
    entite_en_charge: str | None = None
    demandeur_id: int
    responsable_id: int | None
    created_at: datetime
    entites: list[RequeteEntiteOut] = []
    
    # Champs calculés pour l'affichage
    dsm_name: str | None = None  # Nom du DSM demandeur
    demandeur_name: str | None = None  # Nom du demandeur
    statut: str | None = None  # Statut calculé (en cours/terminée)
    en_retard: bool = False  # Indicateur de retard


class RequeteSummaryOut(BaseModel):
    date_creation: str
    type_requete: str
    nombre_demande: int
    nombre_rejete: int
    nombre_effectue: int
    date_fin: str | None
    dsm_id: int | None = None
    dsm_name: str | None = None
    demandeur_name: str | None = None
    statut: str | None = None
    en_retard: bool = False
    delai_attente: int | None = None  # Délai d'attente en jours


class RequeteSummaryPageOut(BaseModel):
    items: list[RequeteSummaryOut]
    total: int
    skip: int
    limit: int
