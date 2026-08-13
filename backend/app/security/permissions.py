"""
Dépendances de sécurité pour les routes FastAPI.

- get_current_user  : extrait et valide le JWT, charge l'utilisateur, vérifie qu'il est actif.
- require_role(...) : factory de dépendance pour restreindre une route à certains rôles
  (correspond aux colonnes "Accès" du Vol.2 §6.4, ex: "MANAGER+" = MANAGER ou ADMIN).
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.enums import RoleUser
from app.security.jwt import decode_token, InvalidTokenError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# "MANAGER+" dans la doc = MANAGER ou ADMIN (l'ADMIN a toujours accès à ce que voit un MANAGER)
MANAGER_PLUS = [RoleUser.MANAGER, RoleUser.ADMIN]
TOUS_ROLES = [RoleUser.ADMIN, RoleUser.MANAGER, RoleUser.DSM, RoleUser.VIEWER]


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Identifiants invalides",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token, expected_type="access")
    except InvalidTokenError:
        raise credentials_error

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_error

    user = db.get(User, int(user_id))
    if user is None:
        raise credentials_error
    if not user.actif:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Compte désactivé")

    return user


def require_role(allowed_roles: list[RoleUser]):
    """
    Usage : Depends(require_role(MANAGER_PLUS))
    Renvoie 403 si le rôle de l'utilisateur courant n'est pas dans la liste autorisée.
    """
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Rôle '{current_user.role.value}' non autorisé pour cette action",
            )
        return current_user
    return dependency
