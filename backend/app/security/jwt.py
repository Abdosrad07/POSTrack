"""
JWT — access + refresh token (Vol.2 §6.2 : authentification stateless, sans session serveur).
Le payload transporte le sub (user id), l'email et le role, pour éviter une requête DB
supplémentaire à chaque appel protégé.
"""
from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError

from app.config import settings

ALGORITHM = settings.JWT_ALGORITHM


def _create_token(data: dict, expires_delta: timedelta, token_type: str) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire, "type": token_type})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=ALGORITHM)


def create_access_token(user_id: int, email: str, role: str) -> str:
    return _create_token(
        {"sub": str(user_id), "email": email, "role": role},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        token_type="access",
    )


def create_refresh_token(user_id: int) -> str:
    return _create_token(
        {"sub": str(user_id)},
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        token_type="refresh",
    )


class InvalidTokenError(Exception):
    pass


def decode_token(token: str, expected_type: str = "access") -> dict:
    """Décode et valide un token. Lève InvalidTokenError si invalide/expiré/mauvais type."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise InvalidTokenError("Token invalide ou expiré")

    if payload.get("type") != expected_type:
        raise InvalidTokenError(f"Type de token incorrect (attendu: {expected_type})")

    return payload
