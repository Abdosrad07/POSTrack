"""Service de portée d'accès (Access Scope).

Détermine, selon le rôle de l'utilisateur connecté, quelles entités
(partenaires, DSM, BTS, POS) il est autorisé à voir dans la plateforme.

Matrice d'accès :
- ADMIN                 → tous les partenaires + leurs DSM, BTS, POS
- MANAGER               → uniquement les DSM, BTS, POS de SON partenaire
- DSM                   → uniquement les POS de SON périmètre DSM
- VIEWER (Détenteur)    → uniquement SON POS
"""
from sqlalchemy.orm import Session

from app.models.enums import RoleUser
from app.models.user import User
from app.models.pos import POS


class AccessScope:
    """Portée d'accès d'un utilisateur : listes d'IDs autorisés."""

    def __init__(
        self,
        partenaire_ids: list[int] | None = None,
        dsm_ids: list[int] | None = None,
        pos_ids: list[int] | None = None,
        bts_ids: list[int] | None = None,
    ):
        # None = accès illimité (ADMIN)
        self.partenaire_ids = partenaire_ids
        self.dsm_ids = dsm_ids
        self.pos_ids = pos_ids
        self.bts_ids = bts_ids

    @property
    def is_admin(self) -> bool:
        return self.partenaire_ids is None

    def filter_partenaire_ids(self, ids: list[int]) -> list[int]:
        if self.partenaire_ids is None:
            return ids
        return [i for i in ids if i in self.partenaire_ids]

    def filter_dsm_ids(self, ids: list[int]) -> list[int]:
        if self.dsm_ids is None:
            return ids
        return [i for i in ids if i in self.dsm_ids]

    def filter_pos_ids(self, ids: list[int]) -> list[int]:
        if self.pos_ids is None:
            return ids
        return [i for i in ids if i in self.pos_ids]

    def filter_bts_ids(self, ids: list[int]) -> list[int]:
        if self.bts_ids is None:
            return ids
        return [i for i in ids if i in self.bts_ids]


def get_access_scope(db: Session, user: User) -> AccessScope:
    """Calcule la portée d'accès de l'utilisateur connecté.

    - ADMIN   → portée illimitée (tous les IDs)
    - MANAGER → filtre sur son partenaire (user.partenaire_id)
    - DSM     → filtre sur son DSM (user.dsm_profile) puis les POS du DSM
    - VIEWER  → filtre sur son POS (user.pos_id)
    """
    role = user.role

    if role == RoleUser.ADMIN:
        return AccessScope()  # partenaire_ids = None → illimité

    if role == RoleUser.MANAGER:
        if not user.partenaire_id:
            return AccessScope(partenaire_ids=[], dsm_ids=[], pos_ids=[], bts_ids=[])
        return AccessScope(
            partenaire_ids=[user.partenaire_id],
            dsm_ids=None,
            pos_ids=None,
            bts_ids=None,
        )

    if role == RoleUser.DSM:
        dsm = user.dsm_profile
        if not dsm:
            return AccessScope(partenaire_ids=[], dsm_ids=[], pos_ids=[], bts_ids=[])
        pos_ids = [p.id for p in dsm.pos_list]
        partenaire_ids = list({p.partenaire_id for p in dsm.pos_list if p.partenaire_id})
        return AccessScope(
            partenaire_ids=partenaire_ids or [],
            dsm_ids=[dsm.id],
            pos_ids=pos_ids,
            bts_ids=None,
        )

    if role == RoleUser.VIEWER:
        if not user.pos_id:
            return AccessScope(partenaire_ids=[], dsm_ids=[], pos_ids=[], bts_ids=[])
        pos = db.get(POS, user.pos_id)
        return AccessScope(
            partenaire_ids=[pos.partenaire_id] if pos else [],
            dsm_ids=[pos.dsm_id] if pos else [],
            pos_ids=[user.pos_id],
            bts_ids=[],
        )

    return AccessScope(partenaire_ids=[], dsm_ids=[], pos_ids=[], bts_ids=[])


def get_visible_partenaire_ids(db: Session, user: User) -> list[int] | None:
    return get_access_scope(db, user).partenaire_ids


def get_visible_dsm_ids(db: Session, user: User) -> list[int] | None:
    return get_access_scope(db, user).dsm_ids


def get_visible_pos_ids(db: Session, user: User) -> list[int] | None:
    return get_access_scope(db, user).pos_ids


def get_visible_bts_ids(db: Session, user: User) -> list[int] | None:
    return get_access_scope(db, user).bts_ids
