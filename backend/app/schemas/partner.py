from datetime import datetime
from pydantic import BaseModel


class PartnerBase(BaseModel):
    code: str
    name: str
    address: str | None = None


class PartnerCreate(PartnerBase):
    pass


class PartnerOut(PartnerBase):
    id: int
    is_active: bool
    bts_import_file_path: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


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

    class Config:
        from_attributes = True
