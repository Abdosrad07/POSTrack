from sqlalchemy.orm import Session

from app.models.revoked_token import RevokedToken


def is_revoked(db: Session, jti: str | None) -> bool:
    if not jti:
        return False
    return db.query(RevokedToken).filter(RevokedToken.jti == jti).first() is not None


def revoke(db: Session, jti: str) -> None:
    if is_revoked(db, jti):
        return
    db.add(RevokedToken(jti=jti))
    db.commit()
