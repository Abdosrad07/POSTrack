"""
Dependances FastAPI transverses : identification JWT, resolution du
role, et surtout get_partner_context / require_partner_access qui
centralisent le controle du PartnerContext (F-02, F-03). Les routes ne
doivent jamais reconstruire ces verifications individuellement.
"""
from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import UnauthorizedError, ForbiddenError
from app.security.jwt import decode_token
from app.security.permissions import Role
from app.crud.user_crud import user_crud, get_authorized_partner_ids, get_authorized_pos_ids
from app.crud.revoked_token_crud import is_revoked
from app.models.user import User
from app.models.dsm import DSM
from app.models.pos import POS


def get_current_token_payload(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> dict:
    """
    Decode et valide le jeton d'acces courant (signature, type, non
    revocation), sans encore verifier l'utilisateur associe. Utilise par
    get_current_user, et par la route /auth/logout qui a besoin du
    'jti' pour revoquer precisement le jeton en cours.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise UnauthorizedError("Jeton d'authentification manquant.")
    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise UnauthorizedError("Jeton invalide ou expire.")
    if is_revoked(db, payload.get("jti")):
        raise UnauthorizedError("Jeton revoque (deconnexion effectuee). Veuillez vous reconnecter.")
    return payload


def get_current_user(
    payload: dict = Depends(get_current_token_payload),
    db: Session = Depends(get_db),
) -> User:
    user = user_crud.get(db, int(payload["sub"]))
    if not user or not user.is_active:
        raise UnauthorizedError("Compte introuvable ou desactive.")
    return user


def require_roles(*roles: Role):
    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise ForbiddenError("Role insuffisant pour cette operation.")
        return user
    return dependency


def get_authorized_partners(db: Session, user: User) -> list[int]:
    """Renvoie la liste des partner_id auxquels l'utilisateur a acces."""
    if user.role == Role.ADMIN:
        from app.models.partner import Partner
        return [p.id for p in db.query(Partner.id).all()]
    if user.role == Role.PARTENAIRE:
        return get_authorized_partner_ids(db, user)
    if user.role == Role.DSM:
        dsm = db.query(DSM).filter(DSM.id == user.dsm_id).first()
        return [dsm.partner_id] if dsm else []
    if user.role == Role.POS_HOLDER:
        pos_ids = get_authorized_pos_ids(db, user)
        partner_ids = {p.partner_id for p in db.query(POS).filter(POS.id.in_(pos_ids)).all()} if pos_ids else set()
        return list(partner_ids)
    return []


def get_partner_context(
    partner_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> int:
    """
    Dependance a utiliser sur toute route /api/partners/{partner_id}/...
    Verifie que l'utilisateur connecte a effectivement acces a ce
    Partenaire ; leve 403 sinon. Retourne le partner_id valide.
    """
    authorized = get_authorized_partners(db, user)
    if partner_id not in authorized:
        raise ForbiddenError("Acces refuse : ce Partenaire n'est pas dans votre perimetre.")
    return partner_id
