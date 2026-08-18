from app.crud.base import CRUDBase
from app.models.partner import Partner
from app.models.dsm import DSM

partner_crud = CRUDBase(Partner)
dsm_crud = CRUDBase(DSM)
