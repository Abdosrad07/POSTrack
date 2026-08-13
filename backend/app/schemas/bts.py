from datetime import date, datetime
from pydantic import BaseModel, ConfigDict

from app.models.enums import StatutBTS, Operateur


class BTSBase(BaseModel):
    code_bts: str
    nom: str
    partenaire_id: int
    operateur: Operateur
    technologie: str | None = None
    region: str | None = None
    ville: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    capacite_max: float
    date_mise_service: date | None = None


class BTSCreate(BTSBase):
    pass


class BTSUpdate(BaseModel):
    nom: str | None = None
    technologie: str | None = None
    region: str | None = None
    ville: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    capacite_max: float | None = None
    statut: StatutBTS | None = None


class BTSOut(BTSBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    statut: StatutBTS
    dernier_taux_saturation: float | None = None
    dernier_rendement: float | None = None
    date_dernier_releve: datetime | None = None


class BTSReleveCreate(BaseModel):
    date_releve: datetime
    charge_mesuree: int
    rendement: float | None = None
    remarque: str | None = None


class BTSReleveOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    bts_id: int
    date_releve: datetime
    charge_mesuree: int
    taux_saturation: float | None = None
    rendement: float | None = None
    remarque: str | None = None
