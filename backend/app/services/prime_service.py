"""
prime_service : gere le cycle de vie d'une Prime (lecture, filtres) et
delegue tout calcul au prime_calculation_service, conformement a la
separation des responsabilites definie dans l'architecture technique.
"""
from sqlalchemy.orm import Session

from app.models.prime import Prime
from app.models.pos import POS


def list_primes(db: Session, partner_id: int, period_id: int | None = None,
                 status: str | None = None, skip: int = 0, limit: int = 100) -> dict:
    query = db.query(Prime).join(POS).filter(POS.partner_id == partner_id)
    if period_id:
        query = query.filter(Prime.prime_period_id == period_id)
    if status:
        query = query.filter(Prime.status == status)
    total = query.order_by(None).count()
    items = query.offset(skip).limit(limit).all()
    return {"items": items, "total": total, "skip": skip, "limit": limit,
            "has_next": skip + len(items) < total}
