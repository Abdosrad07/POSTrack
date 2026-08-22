"""Endpoint hiérarchique de navigation.

GET /api/hierarchy → arborescence Partenaire → DSM → POS, filtrée selon le
rôle de l'utilisateur connecté (AccessScope des 4 rôles v4).

Le format de réponse est aligné sur le composant frontend
HierarchyNavDropdown :
[
  {
    "id": 1,
    "nom": "Camtel Express",
    "code_partenaire": "PART-001",
    "dsms": [
      { "id": 1, "nom": "Jean Marc", "matricule": "DSM-DLA-01",
        "pos": [ { "id": 101, "nom": "Kiosque Akwa Liberte", "code_pos": "POS-DEMO-0001" } ] }
    ],
    "bts": [ { "id": 1, "code_bts": "BTS-DLA-01" } ]
  }
]
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.partner import Partner
from app.models.dsm import DSM
from app.models.bts import BTS
from app.models.pos import POS
from app.api.deps import require_roles
from app.security.permissions import Role
from app.services.access_scope import get_access_scope

router = APIRouter(prefix="/api/hierarchy", tags=["Hiérarchie"])


@router.get("")
def get_hierarchy(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN, Role.MANAGER, Role.CHEF_OPERATIONNEL, Role.OPERATIONNEL)),
):
    """Renvoie l'arborescence visible par l'utilisateur connecté."""
    scope = get_access_scope(db, current_user)

    if scope.partenaire_ids is not None and len(scope.partenaire_ids) == 0:
        return []

    # 1. Récupérer les partenaires visibles (modèle v4 : Partner)
    partenaire_q = db.query(Partner)
    if scope.partenaire_ids is not None:
        partenaire_q = partenaire_q.filter(Partner.id.in_(scope.partenaire_ids or [-1]))
    partenaires = partenaire_q.all()

    part_ids = [p.id for p in partenaires] or [-1]

    # 2. Récupérer les DSM visibles (ceux ayant au moins un POS dans le périmètre)
    dsm_ids_scope = scope.dsm_ids
    if dsm_ids_scope is not None:
        dsm_q = db.query(DSM).filter(DSM.id.in_(dsm_ids_scope or [-1]))
    else:
        dsm_q = (
            db.query(DSM)
            .join(POS, POS.dsm_id == DSM.id)
            .filter(POS.partner_id.in_(part_ids))
            .distinct()
        )
    dsms = dsm_q.all()

    # 3. Récupérer BTS et POS par partenaire
    bts_by_partner: dict[int, list[BTS]] = {}
    for b in db.query(BTS).filter(BTS.partner_id.in_(part_ids)).all():
        bts_by_partner.setdefault(b.partner_id, []).append(b)

    pos_by_partner: dict[int, list[POS]] = {}
    pos_q = db.query(POS).filter(POS.partner_id.in_(part_ids))
    if scope.pos_ids is not None:
        pos_q = pos_q.filter(POS.id.in_(scope.pos_ids or [-1]))
    for p in pos_q.all():
        pos_by_partner.setdefault(p.partner_id, []).append(p)

    # 4. Construire l'arborescence
    result = []
    for part in partenaires:
        part_pos = pos_by_partner.get(part.id, [])
        part_bts = bts_by_partner.get(part.id, [])

        # Filtrer les DSM pour ce partenaire (ceux ayant un POS visible)
        part_dsms = [d for d in dsms if any(p.dsm_id == d.id for p in part_pos)]

        # Inclure le partenaire s'il a au moins un DSM/POS ou une BTS visible
        if not part_dsms and not part_bts:
            continue

        result.append(
            {
                "id": part.id,
                "nom": part.name,
                "code_partenaire": part.code,
                "dsms": [
                    {
                        "id": d.id,
                        "nom": d.full_name,
                        "matricule": d.matricule,
                        "zone": d.zone,
                        "pos": [
                            {
                                "id": p.id,
                                "nom": p.name,
                                "code_pos": p.code_pos,
                                "type_pos": p.type_pos.value if p.type_pos else None,
                                "statut": p.status.value if p.status else None,
                            }
                            for p in part_pos
                            if p.dsm_id == d.id
                        ],
                    }
                    for d in part_dsms
                ],
                "bts": [
                    {
                        "id": b.id,
                        "code_bts": b.code_bts,
                        "operateur": b.operateur,
                    }
                    for b in part_bts
                ],
            }
        )

    return result
