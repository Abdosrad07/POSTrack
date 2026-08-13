import math

from sqlalchemy.orm import Session, joinedload

from app.models.pos import POS


def get_pos(db: Session, pos_id: int) -> POS | None:
    return (
        db.query(POS)
        .options(joinedload(POS.partenaire), joinedload(POS.dsm))
        .filter(POS.id == pos_id)
        .first()
    )


def list_pos(
    db: Session,
    page: int = 1,
    limit: int = 20,
    search: str | None = None,
    statut: str | None = None,
    type_pos: str | None = None,
    partenaire_id: int | None = None,
    dsm_id: int | None = None,
    region: str | None = None,
    sort_by: str = "date_creation",
    order: str = "desc",
) -> tuple[list[POS], dict]:
    query = db.query(POS).options(joinedload(POS.partenaire), joinedload(POS.dsm))

    if search:
        like = f"%{search}%"
        query = query.filter(
            (POS.code_pos.ilike(like))
            | (POS.nom.ilike(like))
            | (POS.telephone.ilike(like))
        )
    if statut:
        query = query.filter(POS.statut == statut)
    if type_pos:
        query = query.filter(POS.type_pos == type_pos)
    if partenaire_id:
        query = query.filter(POS.partenaire_id == partenaire_id)
    if dsm_id:
        query = query.filter(POS.dsm_id == dsm_id)
    if region:
        query = query.filter(POS.region.ilike(f"%{region}%"))

    sort_column = getattr(POS, sort_by, POS.date_creation)
    query = query.order_by(sort_column.desc() if order == "desc" else sort_column.asc())

    total = query.count()
    pages = max(1, math.ceil(total / limit)) if limit else 1
    page = max(1, min(page, pages))
    skip = (page - 1) * limit

    items = query.offset(skip).limit(limit).all()
    pagination = {"page": page, "pages": pages, "total": total, "limit": limit}
    return items, pagination
