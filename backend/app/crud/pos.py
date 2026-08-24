import math
from datetime import date

from sqlalchemy.orm import Session, joinedload

from app.models.pos import POS
from app.models.reconduction import Reconduction
from app.models.enums import TypePOS
from app.schemas.pos import POSCreate, POSUpdate, ReconductionCreate


# ---------------------------------------------------------------------------
# Code POS auto-généré
# ---------------------------------------------------------------------------

def _generate_code_pos(db: Session) -> str:
    """Génère un code POS unique au format POS-YYYYMM-XXXX."""
    today = date.today()
    prefix = today.strftime("POS-%Y%m-")
    last = (
        db.query(POS)
        .filter(POS.code_pos.like(f"{prefix}%"))
        .order_by(POS.id.desc())
        .first()
    )
    seq = 1
    if last:
        try:
            seq = int(last.code_pos.split("-")[-1]) + 1
        except ValueError:
            seq = db.query(POS).filter(POS.code_pos.like(f"{prefix}%")).count() + 1
    return f"{prefix}{seq:04d}"


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------

def get_pos(db: Session, pos_id: int) -> POS | None:
    return (
        db.query(POS)
        .options(joinedload(POS.partenaire), joinedload(POS.dsm))
        .filter(POS.id == pos_id)
        .first()
    )


def create_pos(db: Session, data: POSCreate, created_by_id: int | None = None) -> POS:
    """Crée un POS avec type_pos forcé à NOUVEAU (règle métier critique)."""
    code_pos = _generate_code_pos(db)
    pos = POS(
        code_pos=code_pos,
        nom=data.nom,
        adresse=data.adresse,
        ville=data.ville,
        region=data.region,
        latitude=data.latitude,
        longitude=data.longitude,
        telephone=data.telephone,
        contact_principal=data.contact_principal,
        email_contact=data.email_contact,
        date_creation=data.date_creation,
        date_expiration=data.date_expiration,
        notes=data.notes,
        partenaire_id=data.partenaire_id,
        dsm_id=data.dsm_id,
        type_pos=TypePOS.NOUVEAU,   # TOUJOURS NOUVEAU — jamais modifiable par l'API
        created_by=created_by_id,
    )
    db.add(pos)
    db.commit()
    db.refresh(pos)
    return pos


def update_pos(db: Session, pos_id: int, data: POSUpdate, updated_by_id: int | None = None) -> POS | None:
    """Met à jour un POS. type_pos ne peut pas être modifié ici."""
    pos = get_pos(db, pos_id)
    if not pos:
        return None
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(pos, field, value)
    pos.updated_by = updated_by_id
    db.commit()
    db.refresh(pos)
    return pos


def reconducte_pos(
    db: Session,
    pos_id: int,
    data: ReconductionCreate,
    user_id: int | None = None,
) -> tuple[POS, Reconduction] | None:
    """
    Bascule définitivement le POS en RECONDUIT et historise la reconduction.
    Règle critique : irréversible une fois effectué.
    """
    pos = get_pos(db, pos_id)
    if not pos:
        return None

    ancienne_expiration = pos.date_expiration or date.today()

    # Historique
    reconduction = Reconduction(
        pos_id=pos_id,
        date_reconduction=date.today(),
        ancienne_date_expiration=ancienne_expiration,
        nouvelle_date_expiration=data.nouvelle_date_expiration,
        motif=data.motif,
        valide_par=user_id,
    )
    db.add(reconduction)

    # Bascule irréversible
    pos.type_pos = TypePOS.RECONDUIT
    pos.date_expiration = data.nouvelle_date_expiration
    pos.date_derniere_reconduction = date.today()
    pos.updated_by = user_id

    db.commit()
    db.refresh(pos)
    db.refresh(reconduction)
    return pos, reconduction


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
    pos_ids: list[int] | None = None,
    partenaire_ids: list[int] | None = None,
    dsm_ids: list[int] | None = None,
) -> tuple[list[POS], dict]:
    query = db.query(POS).options(joinedload(POS.partenaire), joinedload(POS.dsm))

    # Portée d'accès (Access Scope)
    if pos_ids is not None:
        query = query.filter(POS.id.in_(pos_ids or [-1]))
    if partenaire_ids is not None:
        query = query.filter(POS.partenaire_id.in_(partenaire_ids or [-1]))
    if dsm_ids is not None:
        query = query.filter(POS.dsm_id.in_(dsm_ids or [-1]))

    if search:
        like = f"%{search}%"
        query = query.filter(
            (POS.code_pos.ilike(like))
            | (POS.nom.ilike(like))
            | (POS.telephone.ilike(like))
            | (POS.ville.ilike(like))
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
