from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.sim import SIM, SIMMovement

sim_crud = CRUDBase(SIM)
sim_movement_crud = CRUDBase(SIMMovement)


def get_by_iccid(db: Session, iccid: str) -> SIM | None:
    return db.query(SIM).filter(SIM.iccid == iccid).first()
