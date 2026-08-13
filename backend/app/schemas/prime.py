from datetime import date
from pydantic import BaseModel, ConfigDict

from app.models.enums import StatutPrime


class PartenaireBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nom: str


class POSBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code_pos: str
    nom: str
    partenaire: PartenaireBrief | None = None


class PrimeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    pos_id: int
    partenaire_id: int | None = None
    montant: float
    date_attribution: date
    statut: StatutPrime
    commentaire: str | None = None
    pos: POSBrief | None = None
    partenaire: PartenaireBrief | None = None
