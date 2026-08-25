from datetime import datetime
from pydantic import BaseModel, ConfigDict


class PartnerBase(BaseModel):
    code: str
    name: str
    address: str | None = None


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

    model_config = ConfigDict(from_attributes=True)
