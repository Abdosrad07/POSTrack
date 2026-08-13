from datetime import date
from pydantic import BaseModel, ConfigDict

from app.models.enums import StatutDSM


class DSMBase(BaseModel):
    matricule: str
    nom_complet: str
    zone_couverture: str
    telephone: str | None = None
    email: str | None = None
    date_affectation: date | None = None


class DSMCreate(DSMBase):
    user_id: int | None = None


class DSMUpdate(BaseModel):
    nom_complet: str | None = None
    zone_couverture: str | None = None
    telephone: str | None = None
    email: str | None = None
    statut: StatutDSM | None = None


class DSMOut(DSMBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    statut: StatutDSM
