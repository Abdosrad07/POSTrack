from datetime import date
from pydantic import BaseModel, ConfigDict

from app.models.enums import StatutPeriodePrime


class PrimePeriodCreate(BaseModel):
    libelle: str
    date_debut: date
    date_fin: date
    partenaire_id: int | None = None
    description: str | None = None


class PrimePeriodUpdate(BaseModel):
    libelle: str | None = None
    date_debut: date | None = None
    date_fin: date | None = None
    description: str | None = None


class PartenaireBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nom: str


class PrimePeriodOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    libelle: str
    date_debut: date
    date_fin: date
    statut: StatutPeriodePrime
    partenaire_id: int | None = None
    description: str | None = None
    partenaire: PartenaireBrief | None = None
    nb_primes: int = 0
