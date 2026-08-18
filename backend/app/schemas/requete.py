from datetime import datetime
from pydantic import BaseModel

from app.models.requete import TypeRequete, PrioriteRequete, StatutRequete


class RequeteEntiteIn(BaseModel):
    entity_type: str   # POS, BTS, CLIENT, PARTNER
    entity_id: int


class RequeteCreate(BaseModel):
    type_requete: TypeRequete
    titre: str
    description: str | None = None
    priorite: PrioriteRequete = PrioriteRequete.NORMALE
    responsable_id: int | None = None
    entites: list[RequeteEntiteIn] = []


class RequeteStatusUpdate(BaseModel):
    statut: StatutRequete
    commentaire: str | None = None


class RequeteEntiteOut(BaseModel):
    entity_type: str
    entity_id: int

    class Config:
        from_attributes = True


class RequeteCommentaireOut(BaseModel):
    id: int
    author_id: int
    statut_apres: StatutRequete | None
    commentaire: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class RequeteOut(BaseModel):
    id: int
    partner_id: int
    type_requete: TypeRequete
    titre: str
    description: str | None
    priorite: PrioriteRequete
    statut: StatutRequete
    demandeur_id: int
    responsable_id: int | None
    created_at: datetime
    closed_at: datetime | None
    entites: list[RequeteEntiteOut] = []

    class Config:
        from_attributes = True
