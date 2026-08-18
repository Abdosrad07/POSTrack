from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.user import User, UserPartner, UserPOS

user_crud = CRUDBase(User)


def get_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def link_partner(db: Session, user_id: int, partner_id: int) -> None:
    db.add(UserPartner(user_id=user_id, partner_id=partner_id))
    db.commit()


def link_pos(db: Session, user_id: int, pos_id: int) -> None:
    db.add(UserPOS(user_id=user_id, pos_id=pos_id))
    db.commit()


def get_authorized_partner_ids(db: Session, user: User) -> list[int]:
    """Retourne les partner_id autorises pour un utilisateur PARTENAIRE."""
    links = db.query(UserPartner).filter(UserPartner.user_id == user.id).all()
    return [l.partner_id for l in links]


def get_authorized_pos_ids(db: Session, user: User) -> list[int]:
    """Retourne les pos_id autorises pour un Detenteur POS."""
    links = db.query(UserPOS).filter(UserPOS.user_id == user.id).all()
    return [l.pos_id for l in links]
