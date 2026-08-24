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

    # Champs d'affichage pour les tableaux frontend (code/nom POS, partenaire,
    # periode) : attributs transitoires lus par PrimeOut via from_attributes.
    for prime in items:
        pos = prime.pos
        prime.pos_code = pos.code_pos if pos else None
        prime.pos_nom = pos.name if pos else None
        prime.partner_name = pos.partner.name if pos and pos.partner else None
        prime.period_code = prime.prime_period.code if prime.prime_period else None

    return {"items": items, "total": total, "skip": skip, "limit": limit,
            "has_next": skip + len(items) < total}
