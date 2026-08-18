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
from app.models.bts import BTS
from app.models.dsm import DSM


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

    - ADMIN   → portée illimitée (tous les partenaires, DSM, BTS, POS)
    - MANAGER → uniquement les DSM, BTS et POS de SON partenaire (user.partenaire_id)
    - DSM     → uniquement les POS de SON périmètre DSM (user.dsm_profile)
    - VIEWER  → uniquement SON POS (user.pos_id)
    """
    role = user.role

    if role == RoleUser.ADMIN:
        return AccessScope()  # Tous les champs à None → illimité

    if role == RoleUser.MANAGER:
        if not user.partenaire_id:
            return AccessScope(partenaire_ids=[], dsm_ids=[], pos_ids=[], bts_ids=[])
        pos_list = db.query(POS).filter(POS.partenaire_id == user.partenaire_id).all()
        pos_ids = [p.id for p in pos_list]
        dsm_ids = list({p.dsm_id for p in pos_list if p.dsm_id})
        bts_list = db.query(BTS).filter(BTS.partenaire_id == user.partenaire_id).all()
        bts_ids = [b.id for b in bts_list]
        return AccessScope(
            partenaire_ids=[user.partenaire_id],
            dsm_ids=dsm_ids,
            pos_ids=pos_ids,
            bts_ids=bts_ids,
        )

    if role == RoleUser.DSM:
        from app.models.dsm import DSM
        dsm = user.dsm_profile or db.query(DSM).filter(DSM.user_id == user.id).first()
        if not dsm:
            return AccessScope(partenaire_ids=[], dsm_ids=[], pos_ids=[], bts_ids=[])
        pos_ids = [p.id for p in dsm.pos_list]
        partenaire_ids = list({p.partenaire_id for p in dsm.pos_list if p.partenaire_id})
        return AccessScope(
            partenaire_ids=partenaire_ids,
            dsm_ids=[dsm.id],
            pos_ids=pos_ids,
            bts_ids=[],
        )

    if role == RoleUser.VIEWER:
        if not user.pos_id:
            return AccessScope(partenaire_ids=[], dsm_ids=[], pos_ids=[], bts_ids=[])
        pos = db.get(POS, user.pos_id)
        if not pos:
            return AccessScope(partenaire_ids=[], dsm_ids=[], pos_ids=[], bts_ids=[])
        return AccessScope(
            partenaire_ids=[pos.partenaire_id] if pos.partenaire_id else [],
            dsm_ids=[pos.dsm_id] if pos.dsm_id else [],
            pos_ids=[pos.id],
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
