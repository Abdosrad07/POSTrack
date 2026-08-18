from app.crud.base import CRUDBase
from app.models.bts import BTS
from app.models.bts_releve import BTSReleve

bts_crud = CRUDBase(BTS)
bts_releve_crud = CRUDBase(BTSReleve)
