"""Service pour le calcul des statistiques de linkage POS."""
from sqlalchemy.orm import Session
from sqlalchemy import case, func

from app.models.pos import POS, LinkageStatus, StatutPos


def get_pos_linkage_stats(db: Session, partner_id: int, dsm_id: int = None) -> dict:
    """Calcule les statistiques de linkage POS pour un partenaire ou un DSM."""
    query = db.query(
        func.count(POS.id).label('total'),
        func.sum(case((POS.holder_user_id.isnot(None), 1), else_=0)).label('linked'),
        func.sum(case((POS.holder_user_id.is_(None), 1), else_=0)).label('unlinked'),
        func.sum(case((POS.status == StatutPos.ACTIF, 1), else_=0)).label('actifs'),
    ).filter(POS.partner_id == partner_id)
    
    if dsm_id:
        query = query.filter(POS.dsm_id == dsm_id)
    
    result = query.first()
    
    return {
        'total': int(result.total or 0),
        'linked': int(result.linked or 0),
        'unlinked': int(result.unlinked or 0),
        'actifs': int(result.actifs or 0),
    }


def get_pos_type_counts(db: Session, partner_id: int, dsm_id: int = None) -> dict:
    """Calcule les compteurs par type de POS (NOUVEAU/RECONDUIT)."""
    query = db.query(
        POS.type_pos,
        func.count(POS.id).label('count')
    ).filter(POS.partner_id == partner_id)
    
    if dsm_id:
        query = query.filter(POS.dsm_id == dsm_id)
    
    query = query.group_by(POS.type_pos)
    
    results = query.all()
    
    return {
        'NOUVEAU': 0,
        'RECONDUIT': 0,
        **{row.type_pos.value: int(row.count) for row in results}
    }