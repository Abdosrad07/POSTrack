from datetime import date
from pydantic import BaseModel, ConfigDict

from app.models.enums import StatutPOS, TypePOS


class PartenaireBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nom: str


class DSMBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nom_complet: str


class POSOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code_pos: str
    nom: str
    ville: str | None = None
    region: str | None = None
    adresse: str | None = None
    statut: StatutPOS
    type_pos: TypePOS
    partenaire_id: int
    dsm_id: int
    date_creation: date
    date_expiration: date | None = None
    date_derniere_reconduction: date | None = None
    telephone: str | None = None
    notes: str | None = None
    partenaire: PartenaireBrief | None = None
    dsm: DSMBrief | None = None


class POSListResponse(BaseModel):
    data: list[POSOut]
    pagination: dict
