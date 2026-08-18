from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.security.password import hash_password


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_in: UserCreate) -> User:
    user = User(
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        nom_complet=user_in.nom_complet,
        role=user_in.role,
        actif=True,
        partenaire_id=user_in.partenaire_id,
        pos_id=user_in.pos_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
