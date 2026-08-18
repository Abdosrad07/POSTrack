"""
Hachage et verification des mots de passe.

Utilise directement la bibliotheque `bcrypt` plutot que passlib : les
versions recentes de bcrypt (>=4) ne sont plus compatibles avec le
detecteur de backend de passlib, ce qui provoque des erreurs au
demarrage. L'appel direct est plus simple et tout aussi sur.
"""
import bcrypt

_MAX_BCRYPT_BYTES = 72


def hash_password(password: str) -> str:
    pw_bytes = password.encode("utf-8")[:_MAX_BCRYPT_BYTES]
    return bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    pw_bytes = plain_password.encode("utf-8")[:_MAX_BCRYPT_BYTES]
    try:
        return bcrypt.checkpw(pw_bytes, hashed_password.encode("utf-8"))
    except ValueError:
        return False
