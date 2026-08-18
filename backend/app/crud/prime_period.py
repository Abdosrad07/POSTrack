import math

from sqlalchemy.orm import Session, joinedload

from app.models.prime_period import PrimePeriod
from app.models.enums import StatutPeriodePrime
from app.schemas.prime_period import PrimePeriodCreate


def create_period(db: Session, data: PrimePeriodCreate) -> PrimePeriod:
    period = PrimePeriod(
        libelle=data.libelle,
        date_debut=data.date_debut,
        date_fin=data.date_fin,
        partenaire_id=data.partenaire_id,
        description=data.description,
        statut=StatutPeriodePrime.OUVERTE,
    )
    db.add(period)
    db.commit()
    db.refresh(period)
    return period


def get_period(db: Session, period_id: int) -> PrimePeriod | None:
    return (
        db.query(PrimePeriod)
        .options(joinedload(PrimePeriod.partenaire))
        .filter(PrimePeriod.id == period_id)
        .first()
    )


def close_period(db: Session, period_id: int) -> PrimePeriod | None:
    period = get_period(db, period_id)
    if not period:
        return None
    period.statut = StatutPeriodePrime.FERMEE
    db.commit()
    db.refresh(period)
    return period


def list_periods(
    db: Session,
    page: int = 1,
    limit: int = 20,
    statut: str | None = None,
    partenaire_id: int | None = None,
) -> tuple[list[PrimePeriod], dict]:
    query = db.query(PrimePeriod).options(joinedload(PrimePeriod.partenaire))
    if statut:
        query = query.filter(PrimePeriod.statut == statut)
    if partenaire_id:
        query = query.filter(
            (PrimePeriod.partenaire_id == partenaire_id) | (PrimePeriod.partenaire_id.is_(None))
        )
    query = query.order_by(PrimePeriod.date_debut.desc())

    total = query.count()
    pages = max(1, math.ceil(total / limit)) if limit else 1
    page = max(1, min(page, pages))
    skip = (page - 1) * limit
    items = query.offset(skip).limit(limit).all()
    pagination = {"page": page, "pages": pages, "total": total, "limit": limit}
    return items, pagination
