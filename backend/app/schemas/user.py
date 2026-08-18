import re
from pydantic import BaseModel, ConfigDict, field_validator

from app.models.enums import RoleUser

# EmailStr (email-validator) rejette les domaines réservés RFC 6761 (.local, .test...),
# hors les comptes de démo du cahier des charges utilisent précisément *.postrack.local.
# On garde donc une validation de forme simple plutôt que la validation stricte RFC.
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _validate_email_format(v: str) -> str:
    if not _EMAIL_RE.match(v):
        raise ValueError("format d'email invalide")
    return v


class UserCreate(BaseModel):
    email: str
    password: str
    nom_complet: str
    role: RoleUser
    partenaire_id: int | None = None
    pos_id: int | None = None

    _check_email = field_validator("email")(_validate_email_format)


class UserLogin(BaseModel):
    email: str
    password: str

    _check_email = field_validator("email")(_validate_email_format)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    nom_complet: str
    role: RoleUser
    actif: bool
    partenaire_id: int | None = None
    pos_id: int | None = None
    dsm_id: int | None = None



class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str
