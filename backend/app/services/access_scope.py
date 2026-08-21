"""Service de portée d'accès pour les 4 rôles applicatifs.

- ADMIN -> accès global + actions correctives
- MANAGER -> consultation globale uniquement
- CHEF_OPERATIONNEL -> consultation + saisie globale + validation des primes
- OPERATIONNEL -> un seul partenaire assigné (user.partner_id)
"""
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.pos import POS
from app.models.bts import BTS
from app.models.dsm import DSM
from app.security.permissions import Role


class AccessScope:
    """Portée d'accès d'un utilisateur : listes d'IDs autorisés (None = illimité)."""

    def __init__(self, partenaire_ids: list[int] | None = None, dsm_ids: list[int] | None = None,
                 pos_ids: list[int] | None = None, bts_ids: list[int] | None = None):
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


def _scope_for_partners(db: Session, partner_ids: list[int]) -> AccessScope:
    partner_ids = list(dict.fromkeys(partner_ids))
    pos_list = db.query(POS).filter(POS.partner_id.in_(partner_ids)).all()
    pos_ids = [p.id for p in pos_list]
    dsm_ids = list({p.dsm_id for p in pos_list if p.dsm_id})
    bts_ids = [b.id for b in db.query(BTS).filter(BTS.partner_id.in_(partner_ids)).all()]
    return AccessScope(partenaire_ids=partner_ids, dsm_ids=dsm_ids, pos_ids=pos_ids, bts_ids=bts_ids)


def get_access_scope(db: Session, user: User) -> AccessScope:
    role = user.role

    if role == Role.ADMIN:
        return AccessScope()

    if role in (Role.MANAGER, Role.CHEF_OPERATIONNEL):
        ids = [p[0] for p in db.query(DSM.partner_id).distinct().all()]
        return _scope_for_partners(db, ids)

    if role == Role.OPERATIONNEL:
        if not user.partner_id:
            return AccessScope(partenaire_ids=[], dsm_ids=[], pos_ids=[], bts_ids=[])
        return _scope_for_partners(db, [user.partner_id])

    return AccessScope(partenaire_ids=[], dsm_ids=[], pos_ids=[], bts_ids=[])


def get_visible_partenaire_ids(db: Session, user: User) -> list[int] | None:
    return get_access_scope(db, user).partenaire_ids


def get_visible_dsm_ids(db: Session, user: User) -> list[int] | None:
    return get_access_scope(db, user).dsm_ids


def get_visible_pos_ids(db: Session, user: User) -> list[int] | None:
    return get_access_scope(db, user).pos_ids


def get_visible_bts_ids(db: Session, user: User) -> list[int] | None:
    return get_access_scope(db, user).bts_ids