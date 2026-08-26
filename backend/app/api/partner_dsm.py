"""Ressources DSM sous /api/partners/{partner_id}/dsm."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case

from app.core.database import get_db
from app.core.errors import NotFoundError
from app.api.deps import get_current_user, get_partner_context
from app.crud.partner_crud import dsm_crud
from app.models.user import User
from app.models.dsm import DSM
from app.models.pos import POS, TypePos, StatutPos
from app.models.sim import SIM, StatutSim, SIMMovement
from app.models.requete import Requete, RequeteEntite
from app.models.prime import Prime, StatutPrime
from app.models.dsm_commission import DSMCommission, StatutCommission
from app.schemas.partner import DSMBase, DSMOut
from app.services.dsm_identity_service import get_dsm_identity

router = APIRouter(prefix="/api/partners/{partner_id}/dsm", tags=["DSM"])


@router.get("", response_model=list[DSMOut])
def list_dsm(partner_id: int = Depends(get_partner_context),
             db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    """Liste des DSM du Partenaire courant (contexte verifie via X-Partner-Context-Id)."""
    return dsm_crud.list(db, partner_id=partner_id, limit=500)


@router.get("/dashboard")
def dsm_dashboard(partner_id: int = Depends(get_partner_context),
                  db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    """Dashboard DSM global : statistiques aggrégées pour tous les DSM du partenaire."""
    
    # Récupérer tous les DSM du partenaire avec leurs statistiques de base
    # Utilisation d'une seule requête avec jointures pour optimiser les performances
    dsm_stats = (
        db.query(
            DSM.id,
            DSM.matricule,
            DSM.full_name,
            DSM.zone,
            func.count(POS.id).label('nb_pos_crees'),
            func.sum(case((POS.status == StatutPos.ACTIF, 1), else_=0)).label('nb_pos_actifs')
        )
        .outerjoin(POS, (POS.partner_id == partner_id) & (POS.dsm_id == DSM.id))
        .filter(DSM.partner_id == partner_id)
        .group_by(DSM.id, DSM.matricule, DSM.full_name, DSM.zone)
        .all()
    )
    
    if not dsm_stats:
        return {
            "partner_id": partner_id,
            "total_dsm": 0,
            "dsms": [],
            "global_stats": {
                "total_pos_crees": 0,
                "total_pos_actifs": 0,
                "total_loading": 0,
                "total_sell_out": 0,
                "total_recettes": 0,
                "total_requetes": 0
            }
        }
    
    dsm_data = []
    total_pos_crees = 0
    total_pos_actifs = 0
    total_loading = 0
    total_sell_out = 0
    total_recettes = 0
    total_requetes = 0
    
    # Statistiques globales partenaire (une seule requête pour éviter N+1)
    global_loading = db.query(func.count(SIM.id)).join(POS).filter(
        POS.partner_id == partner_id,
        SIM.status == StatutSim.EN_STOCK
    ).scalar() or 0
    
    global_sell_out = db.query(func.count(SIMMovement.id)).join(SIM, SIMMovement.sim_id == SIM.id).join(
        POS, SIM.pos_id == POS.id
    ).filter(
        POS.partner_id == partner_id,
        SIMMovement.movement_type.in_(["VENTE", "ACTIVATION"])
    ).scalar() or 0
    
    global_recettes = db.query(func.coalesce(func.sum(Prime.montant), 0)).join(POS).filter(
        POS.partner_id == partner_id,
        Prime.status.in_([StatutPrime.VALIDEE, StatutPrime.PAYEE])
    ).scalar() or 0
    
    global_requetes = db.query(func.count(Requete.id)).filter(
        Requete.partner_id == partner_id,
        Requete.closed_at.is_(None)
    ).scalar() or 0
    
    for dsm_id, matricule, full_name, zone, nb_pos_crees, nb_pos_actifs in dsm_stats:
        # Calculer les statistiques spécifiques par DSM (optimisé)
        dsm_loading = db.query(func.count(SIM.id)).join(POS).filter(
            POS.partner_id == partner_id,
            POS.dsm_id == dsm_id,
            SIM.status == StatutSim.EN_STOCK
        ).scalar() or 0
        
        dsm_sell_out = db.query(func.count(SIMMovement.id)).join(SIM, SIMMovement.sim_id == SIM.id).join(
            POS, SIM.pos_id == POS.id
        ).filter(
            POS.partner_id == partner_id,
            POS.dsm_id == dsm_id,
            SIMMovement.movement_type.in_(["VENTE", "ACTIVATION"])
        ).scalar() or 0
        
        dsm_recettes = db.query(func.coalesce(func.sum(Prime.montant), 0)).join(POS).filter(
            POS.partner_id == partner_id,
            POS.dsm_id == dsm_id,
            Prime.status.in_([StatutPrime.VALIDEE, StatutPrime.PAYEE])
        ).scalar() or 0
        
        dsm_info = {
            "id": dsm_id,
            "matricule": matricule,
            "full_name": full_name,
            "zone": zone,
            "responsable": None,  # Peut être ajouté si le modèle le supporte
            "contact": None,      # Peut être ajouté si le modèle le supporte
            "micro_zone": zone,
            "nb_pos_crees": int(nb_pos_crees or 0),
            "nb_pos_actifs": int(nb_pos_actifs or 0),
            "loading": dsm_loading,
            "sell_out": dsm_sell_out,
            "recettes": float(dsm_recettes),
            "requetes": global_requetes,  # Pour l'instant, requêtes au niveau partenaire
            "progression": None  # Sera calculé à partir des objectifs si disponibles
        }
        
        dsm_data.append(dsm_info)
        
        # Accumuler les totaux globaux
        total_pos_crees += int(nb_pos_crees or 0)
        total_pos_actifs += int(nb_pos_actifs or 0)
        total_loading += dsm_loading
        total_sell_out += dsm_sell_out
        total_recettes += float(dsm_recettes)
        total_requetes = global_requetes
    
    return {
        "partner_id": partner_id,
        "total_dsm": len(dsm_stats),
        "dsms": dsm_data,
        "global_stats": {
            "total_pos_crees": total_pos_crees,
            "total_pos_actifs": total_pos_actifs,
            "total_loading": total_loading,
            "total_sell_out": total_sell_out,
            "total_recettes": total_recettes,
            "total_requetes": total_requetes
        }
    }


@router.get("/identity/{dsm_id}")
def dsm_identity(dsm_id: int, partner_id: int = Depends(get_partner_context),
                 db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    data = get_dsm_identity(db, partner_id=partner_id, dsm_id=dsm_id)
    if not data:
        raise NotFoundError("DSM introuvable dans ce Partenaire.")
    return data


@router.post("", response_model=DSMOut, status_code=201)
def create_dsm(payload: DSMBase, partner_id: int = Depends(get_partner_context),
               db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    """Creation d'un DSM rattache au Partenaire courant (partner_id force serveur)."""
    return dsm_crud.create(db, {**payload.model_dump(), "partner_id": partner_id})


@router.get("/{dsm_id}", response_model=DSMOut)
def get_dsm(dsm_id: int, partner_id: int = Depends(get_partner_context),
            db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    dsm = dsm_crud.get(db, dsm_id)
    if not dsm or getattr(dsm, "partner_id", None) != partner_id:
        raise NotFoundError("DSM introuvable dans ce Partenaire.")
    return dsm