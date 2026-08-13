"""
Vol.2 §6.4 : POST /auth/register, POST /auth/login (JWT), middleware de vérification,
4 rôles (ADMIN/MANAGER/DSM/VIEWER).

Note de conception : /register n'est pas protégé par un rôle ici (le premier ADMIN doit
bien être créé par quelqu'un). En usage réel, on restreint généralement la création de
comptes ADMIN/MANAGER à un utilisateur déjà ADMIN une fois le premier compte créé — à
faire évoluer si le référent client le demande en recette. Pour le MVP à 14 jours, on
reste sur l'ouverture simple décrite dans la doc.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.crud.user import get_user_by_email, create_user
from app.schemas.user import UserCreate, UserLogin, UserOut, Token, RefreshRequest
from app.security.password import verify_password
from app.security.jwt import create_access_token, create_refresh_token, decode_token, InvalidTokenError

router = APIRouter()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cet email est déjà utilisé")
    return create_user(db, user_in)


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, credentials.email)
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
        )
    if not user.actif:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Compte désactivé")

    return Token(
        access_token=create_access_token(user.id, user.email, user.role.value),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=Token)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    try:
        data = decode_token(payload.refresh_token, expected_type="refresh")
    except InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token invalide")

    user = db.get(User, int(data["sub"]))
    if not user or not user.actif:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Utilisateur invalide")

    return Token(
        access_token=create_access_token(user.id, user.email, user.role.value),
        refresh_token=create_refresh_token(user.id),
    )
