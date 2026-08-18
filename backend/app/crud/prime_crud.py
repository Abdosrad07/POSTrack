from app.crud.base import CRUDBase
from app.models.prime_period import PrimePeriod
from app.models.prime import Prime
from app.models.dsm_commission import DSMCommission

prime_period_crud = CRUDBase(PrimePeriod)
prime_crud = CRUDBase(Prime)
dsm_commission_crud = CRUDBase(DSMCommission)
