"""Routes d'authentification et de résolution du contexte.

Elles restent hors du préfixe /api/partners car elles établissent
l'identité avant la sélection du partenaire.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import UnauthorizedError
from app.crud.user_crud import get_by_username, user_crud, link_partner, link_pos
from app.models.partner import Partner
from app.schemas.auth import (
    LoginRequest, TokenResponse, RefreshRequest, LogoutRequest,
    UserOut, UserCreate, UserUpdate, PartnerAvailable,
)
from app.schemas.pagination import Page
from app.security.password import verify_password, hash_password
from app.security.jwt import create_access_token, create_refresh_token, decode_token
from app.api.deps import get_current_user, get_current_token_payload, require_roles, get_authorized_partners
from app.crud.revoked_token_crud import revoke, is_revoked
from app.security.login_guard import register_failed_attempt, register_success, is_locked, seconds_until_unlock
from app.security.permissions import Role
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentification"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    if is_locked(payload.username):
        raise UnauthorizedError(
            f"Trop de tentatives echouees. Reessayez dans {seconds_until_unlock(payload.username)} secondes.",
        )

    user = get_by_username(db, payload.username)
    if not user or not verify_password(payload.password, user.hashed_password) or not user.is_active:
        register_failed_attempt(payload.username)
        raise UnauthorizedError("Identifiants incorrects ou compte inactif.")

    register_success(payload.username)
    return TokenResponse(
        access_token=create_access_token(user.id, user.role.value),
        refresh_token=create_refresh_token(user.id),
    )


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    data = decode_token(payload.refresh_token)
    if not data or data.get("type") != "refresh":
        raise UnauthorizedError("Refresh token invalide ou expire.")
    if is_revoked(db, data.get("jti")):
        raise UnauthorizedError("Refresh token revoque. Veuillez vous reconnecter.")
    user = user_crud.get(db, int(data["sub"]))
    if not user or not user.is_active:
        raise UnauthorizedError("Compte introuvable ou desactive.")

    # Rotation du refresh token : celui qui vient d'etre utilise est
    # immediatement revoque, un nouveau est emis. Limite la fenetre
    # d'exploitation si un refresh token venait a etre vole/rejoue.
    revoke(db, data["jti"])

    return TokenResponse(
        access_token=create_access_token(user.id, user.role.value),
        refresh_token=create_refresh_token(user.id),
    )


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.post("/logout", status_code=204)
def logout(payload: LogoutRequest | None = None,
           token_payload: dict = Depends(get_current_token_payload),
           db: Session = Depends(get_db)):
    """
    Revoque le jeton d'acces courant (identifie par son 'jti'), et le
    refresh token associe si le client le transmet dans le corps de la
    requete : toute requete ulterieure avec l'un ou l'autre jeton sera
    rejetee, meme s'ils ne sont pas encore expires.
    """
    revoke(db, token_payload["jti"])
    if payload and payload.refresh_token:
        refresh_data = decode_token(payload.refresh_token)
        if refresh_data and refresh_data.get("jti"):
            revoke(db, refresh_data["jti"])
    return None


@router.get("/partenaires/available", response_model=list[PartnerAvailable])
def available_partners(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    ids = get_authorized_partners(db, user)
    if not ids:
        return []
    return db.query(Partner).filter(Partner.id.in_(ids)).all()


@router.post("/users", response_model=UserOut, status_code=201)
def create_user(payload: UserCreate, db: Session = Depends(get_db),
                 _admin: User = Depends(require_roles(Role.ADMIN))):
    """Création de compte réservée à l'ADMIN (écran d'administration)."""
    data = payload.model_dump(exclude={"password", "partner_ids", "pos_ids"})
    user = user_crud.create(db, {**data, "hashed_password": hash_password(payload.password)})
    for pid in payload.partner_ids:
        link_partner(db, user.id, pid)
    for posid in payload.pos_ids:
        link_pos(db, user.id, posid)
    return user


@router.get("/users", response_model=Page[UserOut])
def list_users(role: Role | None = None, is_active: bool | None = None,
               skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
               _admin: User = Depends(require_roles(Role.ADMIN))):
    """Liste des comptes, réservée à l'ADMIN (écran d'administration)."""
    return user_crud.list_paginated(db, skip=skip, limit=limit, role=role, is_active=is_active)


@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db),
                 _admin: User = Depends(require_roles(Role.ADMIN))):
    """Mise à jour d'un compte, réservée à l'ADMIN."""
    from app.core.errors import NotFoundError
    target = user_crud.get(db, user_id)
    if not target:
        raise NotFoundError("Utilisateur introuvable.")
    return user_crud.update(db, target, payload.model_dump(exclude_unset=True))
