from sqlalchemy.orm import Session, joinedload

from app.models.bts import BTS
from app.models.bts_releve import BTSReleve
from app.schemas.bts import BTSCreate, BTSUpdate


def get_bts(db: Session, bts_id: int) -> BTS | None:
    return db.get(BTS, bts_id)


def get_bts_by_code(db: Session, code: str) -> BTS | None:
    return db.query(BTS).filter(BTS.code_bts == code).first()


def list_bts(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    partenaire_id: int | None = None,
    statut: str | None = None,
    bts_ids: list[int] | None = None,
    partenaire_ids: list[int] | None = None,
) -> list[BTS]:
    query = db.query(BTS)
    if bts_ids is not None:
        query = query.filter(BTS.id.in_(bts_ids or [-1]))
    if partenaire_ids is not None:
        query = query.filter(BTS.partenaire_id.in_(partenaire_ids or [-1]))
    if partenaire_id:
        query = query.filter(BTS.partenaire_id == partenaire_id)
    if statut:
        query = query.filter(BTS.statut == statut)
    return query.offset(skip).limit(limit).all()


def create_bts(db: Session, data: BTSCreate) -> BTS:
    bts = BTS(**data.model_dump())
    db.add(bts)
    db.commit()
    db.refresh(bts)
    return bts


def update_bts(db: Session, bts: BTS, data: BTSUpdate) -> BTS:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(bts, field, value)
    db.commit()
    db.refresh(bts)
    return bts


def list_all_releves(db: Session, skip: int = 0, limit: int = 200) -> list[BTSReleve]:
    return (
        db.query(BTSReleve)
        .options(joinedload(BTSReleve.bts))
        .order_by(BTSReleve.date_releve.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def list_releves(db: Session, bts_id: int, skip: int = 0, limit: int = 100) -> list[BTSReleve]:
    return (
        db.query(BTSReleve)
        .filter(BTSReleve.bts_id == bts_id)
        .order_by(BTSReleve.date_releve.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
