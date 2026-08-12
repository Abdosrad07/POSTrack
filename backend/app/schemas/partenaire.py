from datetime import date
from pydantic import BaseModel, ConfigDict

from app.models.enums import StatutPartenaire, TypePartenaire


class PartenaireBase(BaseModel):
    code_partenaire: str
    nom: str
    type_partenaire: TypePartenaire
    region: str | None = None
    ville: str | None = None
    adresse: str | None = None
    contact_principal: str | None = None
    telephone: str | None = None
    email: str | None = None
    date_signature_contrat: date | None = None
    date_fin_contrat: date | None = None


class PartenaireCreate(PartenaireBase):
    pass


class PartenaireUpdate(BaseModel):
    nom: str | None = None
    type_partenaire: TypePartenaire | None = None
    region: str | None = None
    ville: str | None = None
    adresse: str | None = None
    contact_principal: str | None = None
    telephone: str | None = None
    email: str | None = None
    date_fin_contrat: date | None = None
    statut: StatutPartenaire | None = None


class PartenaireOut(PartenaireBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    statut: StatutPartenaire
