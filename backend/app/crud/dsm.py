from sqlalchemy.orm import Session

from app.models.dsm import DSM
from app.schemas.dsm import DSMCreate, DSMUpdate


def get_dsm(db: Session, dsm_id: int) -> DSM | None:
    return db.get(DSM, dsm_id)


def get_dsm_by_matricule(db: Session, matricule: str) -> DSM | None:
    return db.query(DSM).filter(DSM.matricule == matricule).first()


def list_dsm(db: Session, skip: int = 0, limit: int = 50) -> list[DSM]:
    return db.query(DSM).offset(skip).limit(limit).all()


def create_dsm(db: Session, data: DSMCreate) -> DSM:
    dsm = DSM(**data.model_dump())
    db.add(dsm)
    db.commit()
    db.refresh(dsm)
    return dsm


def update_dsm(db: Session, dsm: DSM, data: DSMUpdate) -> DSM:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(dsm, field, value)
    db.commit()
    db.refresh(dsm)
    return dsm


def deactivate_dsm(db: Session, dsm: DSM) -> DSM:
    """Vol.2 §6.3 : DELETE /api/dsm/{id} désactive (statut=INACTIF), ne supprime pas la ligne
    — un DSM peut avoir des POS rattachés, on garde l'historique."""
    from app.models.enums import StatutDSM
    dsm.statut = StatutDSM.INACTIF
    db.commit()
    db.refresh(dsm)
    return dsm
