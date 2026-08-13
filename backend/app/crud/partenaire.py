from sqlalchemy.orm import Session

from app.models.partenaire import Partenaire
from app.schemas.partenaire import PartenaireCreate, PartenaireUpdate


def get_partenaire(db: Session, partenaire_id: int) -> Partenaire | None:
    return db.get(Partenaire, partenaire_id)


def get_partenaire_by_code(db: Session, code: str) -> Partenaire | None:
    return db.query(Partenaire).filter(Partenaire.code_partenaire == code).first()


def list_partenaires(
    db: Session, skip: int = 0, limit: int = 50, statut: str | None = None
) -> list[Partenaire]:
    query = db.query(Partenaire)
    if statut:
        query = query.filter(Partenaire.statut == statut)
    return query.offset(skip).limit(limit).all()


def create_partenaire(db: Session, data: PartenaireCreate, created_by: int) -> Partenaire:
    partenaire = Partenaire(**data.model_dump(), created_by=created_by)
    db.add(partenaire)
    db.commit()
    db.refresh(partenaire)
    return partenaire


def update_partenaire(db: Session, partenaire: Partenaire, data: PartenaireUpdate) -> Partenaire:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(partenaire, field, value)
    db.commit()
    db.refresh(partenaire)
    return partenaire


def delete_partenaire(db: Session, partenaire: Partenaire) -> None:
    db.delete(partenaire)
    db.commit()
