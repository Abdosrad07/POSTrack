from datetime import date, datetime
from pydantic import BaseModel, ConfigDict


class PartnerBase(BaseModel):
    code: str
    name: str
    address: str | None = None
    contract_start_date: date | None = None


class PartnerCreate(PartnerBase):
    responsable_name: str | None = None
    responsable_contact: str | None = None
    responsable_user_id: int | None = None
    commercial_name: str | None = None
    commercial_contact: str | None = None
    commercial_user_id: int | None = None
    master_sim_number: str | None = None


class PartnerOut(PartnerBase):
    id: int
    is_active: bool
    bts_import_file_path: str | None = None
    responsable_name: str | None = None
    responsable_contact: str | None = None
    responsable_user_id: int | None = None
    commercial_name: str | None = None
    commercial_contact: str | None = None
    commercial_user_id: int | None = None
    master_sim_number: str | None = None
    created_at: datetime
    # Compteur POS calcule cote API (une requete GROUP BY) pour les
    # tableaux frontend ; None si l'endpoint n'a pas enrichi la ligne.
    pos_count: int | None = None

    model_config = ConfigDict(from_attributes=True)


class MicroZoneBase(BaseModel):
    name: str
    code: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class MicroZoneCreate(MicroZoneBase):
    pass


class MicroZoneOut(MicroZoneBase):
    id: int
    partner_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PartnerIdentityOut(BaseModel):
    """Carte d'identité partenaire (étape 5).

    Identité déclarative (responsable, commercial, MasterSIM) + compteurs
    d'exploitation calculés côté backend : le frontend n'invente jamais de
    valeur métier et affiche « Non renseigné » pour tout champ absent.
    """
    id: int
    code: str
    name: str
    address: str | None = None
    is_active: bool
    contract_start_date: date | None = None
    created_at: datetime

    responsable_name: str | None = None
    responsable_contact: str | None = None
    responsable_user_id: int | None = None
    responsable_username: str | None = None

    commercial_name: str | None = None
    commercial_contact: str | None = None
    commercial_user_id: int | None = None
    commercial_username: str | None = None

    master_sim_number: str | None = None

    nb_micro_zones: int = 0
    nb_pos_crees: int = 0
    nb_pos_actifs: int = 0
    nb_bts: int = 0

    model_config = ConfigDict(from_attributes=True)


class DSMBase(BaseModel):
    matricule: str
    full_name: str
    zone: str | None = None


class DSMCreate(DSMBase):
    partner_id: int


class DSMOut(DSMBase):
    id: int
    partner_id: int
    created_at: datetime
    # Champs d'affichage calcules cote API pour les tableaux frontend :
    # nom du partenaire porteur et nombre de POS supervises. None si non
    # enrichi par l'endpoint appelant.
    partner_name: str | None = None
    nb_pos_crees: int | None = None

    model_config = ConfigDict(from_attributes=True)
