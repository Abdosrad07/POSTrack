from sqlalchemy.orm import Session, joinedload

from app.models.prime import Prime
from app.models.pos import POS


def list_primes(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    statut: str | None = None,
    partenaire_id: int | None = None,
) -> list[Prime]:
    query = (
        db.query(Prime)
        .options(joinedload(Prime.pos).joinedload(POS.partenaire))
    )
    if statut:
        query = query.filter(Prime.statut == statut)
    if partenaire_id:
        query = query.filter(Prime.partenaire_id == partenaire_id)
    return query.order_by(Prime.date_attribution.desc()).offset(skip).limit(limit).all()
