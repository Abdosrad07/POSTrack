<<<<<<< HEAD
from datetime import date, datetime
from pydantic import BaseModel

from app.models.pos import TypePos, StatutPos


class POSCreate(BaseModel):
    code_pos: str
    name: str
    address: str | None = None
    zone: str | None = None
    dsm_id: int
    holder_user_id: int | None = None
    date_creation: date
    date_expiration: date


class POSUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    zone: str | None = None
    holder_user_id: int | None = None
    status: StatutPos | None = None


class POSOut(BaseModel):
    id: int
    code_pos: str
    name: str
    address: str | None
    zone: str | None
    partner_id: int
    dsm_id: int
    holder_user_id: int | None
    type_pos: TypePos
    status: StatutPos
    date_creation: date
    date_expiration: date
    date_derniere_reconduction: date | None
    created_at: datetime

    class Config:
        from_attributes = True


class ReconductionCreate(BaseModel):
    new_expiration: date
    motif: str | None = None


class ReconductionOut(BaseModel):
    id: int
    pos_id: int
    old_expiration: date
    new_expiration: date
    motif: str | None
    author_id: int
    created_at: datetime

    class Config:
        from_attributes = True
=======
from datetime import date
from pydantic import BaseModel, ConfigDict, field_validator

from app.models.enums import StatutPOS, TypePOS


class PartenaireBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nom: str


class DSMBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nom_complet: str
    matricule: str | None = None


class PrimeBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    statut: str
    montant: float


class POSCreate(BaseModel):
    """Schéma de création — type_pos forcé à NOUVEAU côté service, non exposé ici."""
    nom: str
    partenaire_id: int
    dsm_id: int
    adresse: str | None = None
    ville: str | None = None
    region: str | None = None
    telephone: str | None = None
    contact_principal: str | None = None
    email_contact: str | None = None
    date_creation: date
    date_expiration: date | None = None
    notes: str | None = None


class POSUpdate(BaseModel):
    """Tous les champs sont optionnels. type_pos ne peut pas être modifié ici."""
    nom: str | None = None
    adresse: str | None = None
    ville: str | None = None
    region: str | None = None
    telephone: str | None = None
    contact_principal: str | None = None
    email_contact: str | None = None
    date_expiration: date | None = None
    statut: StatutPOS | None = None
    notes: str | None = None


class ReconductionCreate(BaseModel):
    nouvelle_date_expiration: date
    motif: str | None = None


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
    contact_principal: str | None = None
    email_contact: str | None = None
    notes: str | None = None
    partenaire: PartenaireBrief | None = None
    dsm: DSMBrief | None = None
    # La prime courante (la plus récente si plusieurs périodes)
    prime_active: PrimeBrief | None = None


class POSListResponse(BaseModel):
    data: list[POSOut]
    pagination: dict
>>>>>>> origin/dev
