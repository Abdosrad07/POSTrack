"""Endpoint hiérarchique de navigation.

GET /api/hierarchy → arborescence Partenaire → DSM → POS → BTS,
filtrée selon le rôle de l'utilisateur connecté (AccessScope).

Exemple de réponse :
[
  {
    "id": 1,
    "nom": "Partenaire ABC",
    "code_partenaire": "P001",
    "dsms": [
      { "id": 1, "nom": "DSM A", "pos": [ {"id": 10, "nom": "POS X"} ] }
    ],
    "bts": [ {"id": 5, "nom": "BTS 1"} ]
  }
]
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.user import User
from app.models.enums import RoleUser
from app.models.partner import Partner
from app.models.dsm import DSM
from app.models.bts import BTS
from app.models.pos import POS
from app.security.permissions import require_role, TOUS_ROLES
from app.services.access_scope import get_access_scope

router = APIRouter()


@router.get("")
def get_hierarchy(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TOUS_ROLES)),
):
    """Renvoie l'arborescence visible par l'utilisateur connecté."""
    scope = get_access_scope(db, current_user)

    if scope.partenaire_ids is not None and len(scope.partenaire_ids) == 0:
        return []

    # 1. Récupérer les partenaires visibles
    partenaire_q = db.query(Partenaire).options(
        joinedload(Partenaire.pos_list).joinedload(POS.dsm),
        joinedload(Partenaire.bts_list),
    )
    if scope.partenaire_ids is not None:
        partenaire_q = partenaire_q.filter(Partenaire.id.in_(scope.partenaire_ids or [-1]))
    partenaires = partenaire_q.all()

    # 2. Récupérer les DSM visibles
    dsm_ids_scope = scope.dsm_ids
    if dsm_ids_scope is not None:
        dsm_q = db.query(DSM).filter(DSM.id.in_(dsm_ids_scope or [-1]))
    else:
        part_ids = [p.id for p in partenaires] or [-1]
        dsm_q = (
            db.query(DSM)
            .join(POS, POS.dsm_id == DSM.id)
            .filter(POS.partenaire_id.in_(part_ids))
            .distinct()
        )
    dsms = dsm_q.all()

    # 3. Construire l'arborescence
    result = []
    for part in partenaires:
        part_pos = list(part.pos_list)
        part_bts = list(part.bts_list)

        # Filtrer les POS par portée
        if scope.pos_ids is not None:
            part_pos = [p for p in part_pos if p.id in scope.pos_ids]
        if scope.bts_ids is not None:
            part_bts = [b for b in part_bts if b.id in scope.bts_ids]

        # Filtrer les DSM pour ce partenaire
        part_dsms = [d for d in dsms if any(p.dsm_id == d.id for p in part_pos)]

        # Si aucun POS n'est visible dans ce partenaire, ne pas l'inclure.
        if (scope.pos_ids is not None or scope.dsm_ids is not None) and len(part_pos) == 0 and len(part_bts) == 0:
            continue

        result.append(
            {
                "id": part.id,
                "nom": part.nom,
                "code_partenaire": part.code_partenaire,
                "type_partenaire": part.type_partenaire.value if part.type_partenaire else None,
                "region": part.region,
                "ville": part.ville,
                "statut": part.statut.value if part.statut else None,
                "dsms": [
                    {
                        "id": d.id,
                        "nom": d.nom_complet,
                        "matricule": d.matricule,
                        "zone_couverture": d.zone_couverture,
                        "statut": d.statut.value if d.statut else None,
                        "pos": [
                            {
                                "id": p.id,
                                "nom": p.nom,
                                "code_pos": p.code_pos,
                                "ville": p.ville,
                                "type_pos": p.type_pos.value if p.type_pos else None,
                                "statut": p.statut.value if p.statut else None,
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
                        "nom": b.nom,
                        "code_bts": b.code_bts,
                        "ville": b.ville,
                        "statut": b.statut.value if b.statut else None,
                    }
                    for b in part_bts
                ],
            }
        )

    return result
