"""Endpoint de representation geographique du territoire d'un DSM.

GET /api/partners/{partner_id}/dsm/{dsm_id}/geo

Renvoie les donnees geographiques RELLES du DSM, scopees sur le
PartnerContext et filtrees sur le DSM specifique :
  - `pos`          : points POS assignes au DSM avec coordonnees + zone/quartier
  - `bts`          : points BTS du partenaire (tous les BTS sont au niveau partenaire)
                     avec operateur, saturation, statut
  - `micro_zones`  : micro-zones declarees du partenaire (avec leur polygone `boundaries`
                     si le client en a fourni ; NULL sinon)
  - `zones`        : quartiers/zones effectivement couverts par le DSM, derives des
                     donnees reelles (valeurs distinctes de pos.zone)
  - `territory`    : polygone GeoJSON derive de l'ENVELOPPE CONVEXE des points
                     de presence reels du DSM (POS). NULL si moins de 3 points
                     distincts.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_partner_context, get_current_user
from app.models.user import User
from app.models.partner import Partner, MicroZone
from app.models.bts import BTS
from app.models.bts_releve import BTSReleve
from app.models.pos import POS
from app.models.dsm import DSM

router = APIRouter(prefix="/api/partners/{partner_id}/dsm/{dsm_id}/geo", tags=["Géographie DSM"])


def _cross(o: tuple[float, float], a: tuple[float, float], b: tuple[float, float]) -> float:
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def _convex_hull(points: list[tuple[float, float]]) -> list[list[float]]:
    """Enveloppe convexe (Andrew monotone chain) des coordonnees reelles.

    Retourne un anneau [longitude, latitude] ferme (GeoJSON) ou liste vide
    si < 3 points distincts.
    """
    pts = sorted({(round(float(x), 6), round(float(y), 6)) for x, y in points})
    if len(pts) < 3:
        return []
    lower: list[tuple[float, float]] = []
    for p in pts:
        while len(lower) >= 2 and _cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    upper: list[tuple[float, float]] = []
    for p in reversed(pts):
        while len(upper) >= 2 and _cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    hull = lower[:-1] + upper[:-1]
    # Return closed ring in GeoJSON format: [longitude, latitude]
    return [[lng, lat] for lat, lng in hull] + [[hull[0][1], hull[0][0]]]


def _bts_statut(bts_id: int, last: BTSReleve | None) -> str:
    return (last.statut or "actif").lower() if last else "inconnu"


def _nearest_microzone(pos: POS, microzones: list[MicroZone]) -> MicroZone | None:
    if pos.latitude is None or pos.longitude is None or not microzones:
        return None
    best = None
    best_d2 = 25.0 ** 2
    for mz in microzones:
        if mz.latitude is None or mz.longitude is None:
            continue
        d2 = (mz.latitude - pos.latitude) ** 2 + (mz.longitude - pos.longitude) ** 2
        if d2 <= best_d2:
            best_d2 = d2
            best = mz
    return best


@router.get("")
def dsm_geo_territoire(
    dsm_id: int,
    partner_id: int = Depends(get_partner_context),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    # Verify DSM belongs to partner
    dsm = db.query(DSM).filter(DSM.id == dsm_id, DSM.partner_id == partner_id).first()
    if not dsm:
        return {
            "partner_id": partner_id,
            "dsm_id": dsm_id,
            "dsm_name": None,
            "pos": [],
            "bts": [],
            "micro_zones": [],
            "zones": [],
            "territory": None,
            "has_geo_data": False,
        }

    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        return {
            "partner_id": partner_id,
            "dsm_id": dsm_id,
            "dsm_name": dsm.full_name,
            "pos": [],
            "bts": [],
            "micro_zones": [],
            "zones": [],
            "territory": None,
            "has_geo_data": False,
        }

    microzones = (
        db.query(MicroZone).filter(MicroZone.partner_id == partner_id).order_by(MicroZone.id).all()
    )

    # Get POS assigned to this DSM
    pos_rows = db.query(POS).filter(POS.partner_id == partner_id, POS.dsm_id == dsm_id).all()
    pos_payload = []
    pos_points: list[tuple[float, float]] = []
    
    for pos in pos_rows:
        if pos.latitude is not None and pos.longitude is not None:
            pos_points.append((float(pos.latitude), float(pos.longitude)))
        mz = _nearest_microzone(pos, microzones)
        pos_payload.append(
            {
                "id": pos.id,
                "code_pos": pos.code_pos,
                "name": pos.name,
                "address": pos.address,
                "latitude": pos.latitude,
                "longitude": pos.longitude,
                "zone": pos.zone,
                "quartier": pos.zone,
                "micro_zone": mz.name if mz else None,
                "type_pos": pos.type_pos.value if pos.type_pos else None,
                "status": pos.status.value if pos.status else None,
            }
        )

    # Get all BTS for the partner (BTS are partner-level, not DSM-level)
    bts_rows = db.query(BTS).filter(BTS.partner_id == partner_id).all()
    bts_payload = []
    bts_points: list[tuple[float, float]] = []
    
    for bts in bts_rows:
        last = (
            db.query(BTSReleve)
            .filter(BTSReleve.bts_id == bts.id)
            .order_by(BTSReleve.date_releve.desc())
            .first()
        )
        if bts.latitude is not None and bts.longitude is not None:
            bts_points.append((float(bts.latitude), float(bts.longitude)))
        # Find nearest microzone for BTS
        best_mz = None
        if bts.latitude is not None and bts.longitude is not None:
            best_d2 = 25.0 ** 2
            for mz in microzones:
                if mz.latitude is None or mz.longitude is None:
                    continue
                d2 = (mz.latitude - bts.latitude) ** 2 + (mz.longitude - bts.longitude) ** 2
                if d2 <= best_d2:
                    best_d2 = d2
                    best_mz = mz
        
        bts_payload.append(
            {
                "id": bts.id,
                "code": bts.code_bts,
                "operateur": bts.operateur,
                "technologie": bts.technologie,
                "latitude": bts.latitude,
                "longitude": bts.longitude,
                "zone": bts.zone,
                "quartier": bts.zone,
                "micro_zone": best_mz.name if best_mz else None,
                "saturation": last.taux_saturation if last else None,
                "statut": _bts_statut(bts.id, last),
            }
        )

    micro_payload = [
        {
            "id": mz.id,
            "name": mz.name,
            "code": mz.code,
            "latitude": mz.latitude,
            "longitude": mz.longitude,
            "boundaries": mz.boundaries,
        }
        for mz in microzones
    ]

    # Collect zones from POS (DSM-specific)
    from collections import defaultdict
    zone_points: dict[str, list[tuple[float, float]]] = defaultdict(list)
    
    for pos in pos_rows:
        if pos.latitude is not None and pos.longitude is not None and pos.zone:
            zone_points[pos.zone].append((float(pos.latitude), float(pos.longitude)))

    # Build zones payload with convex hull if enough points
    zones_payload = []
    for zone_name, points in zone_points.items():
        if len(points) >= 3:
            hull = _convex_hull(points)
            zones_payload.append({
                "name": zone_name,
                "point_count": len(points),
                "boundaries": {
                    "type": "Polygon",
                    "coordinates": [hull]
                }
            })

    # Build territory: convex hull of DSM's POS points
    territory = None
    if len(pos_points) >= 3:
        territory = {"type": "Polygon", "coordinates": [_convex_hull(pos_points)]}

    return {
        "partner_id": partner_id,
        "partner_name": partner.name,
        "dsm_id": dsm_id,
        "dsm_name": dsm.full_name,
        "dsm_zone": dsm.zone,
        "pos": pos_payload,
        "bts": bts_payload,
        "micro_zones": micro_payload,
        "zones": zones_payload,
        "territory": territory,
        "has_geo_data": bool(pos_points or bts_points or any(mz.get("boundaries") for mz in micro_payload)),
    }
