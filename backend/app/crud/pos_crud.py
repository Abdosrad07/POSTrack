from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.pos import POS
from app.models.reconduction import Reconduction
from app.models.pos_performance import POSPerformance

pos_crud = CRUDBase(POS)
reconduction_crud = CRUDBase(Reconduction)
pos_performance_crud = CRUDBase(POSPerformance)


def get_by_code_in_partner(db: Session, partner_id: int, code_pos: str) -> POS | None:
    return db.query(POS).filter(POS.partner_id == partner_id, POS.code_pos == code_pos).first()
