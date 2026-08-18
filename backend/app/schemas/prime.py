from datetime import date
from pydantic import BaseModel, ConfigDict

from app.models.enums import StatutPrime


class PartenaireBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nom: str


class DSMBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nom_complet: str


class POSBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    code_pos: str
    nom: str
    type_pos: str
    partenaire: PartenaireBrief | None = None


class PrimePeriodBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    libelle: str
    statut: str


class DSMCommissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    montant_commission: float
    taux_commission: float
    statut: str


class PrimeCreate(BaseModel):
    pos_id: int
    period_id: int
    montant: float
    commentaire: str | None = None


class PrimeTransitionIn(BaseModel):
    """Payload pour les transitions de statut (optionnel)."""
    commentaire: str | None = None


class PrimeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    pos_id: int
    period_id: int
    partenaire_id: int | None = None
    montant: float
    date_attribution: date
    statut: StatutPrime
    commentaire: str | None = None
    pos: POSBrief | None = None
    period: PrimePeriodBrief | None = None
    partenaire: PartenaireBrief | None = None
    dsm_commission: DSMCommissionOut | None = None


class PrimeListResponse(BaseModel):
    data: list[PrimeOut]
    pagination: dict
