"""Mouvements de stock SIM et gestion du stock_actuel du POS."""
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError, ValidationErrorApp
from app.crud.sim_crud import sim_crud, sim_movement_crud, get_by_iccid
from app.models.pos import POS
from app.models.sim import SIM, StatutSim, TypeMouvementSim, SIMMovement
from app.services import audit_service

# Transitions de statut induites par chaque type de mouvement de stock.
_MOVEMENT_TO_STATUS = {
    TypeMouvementSim.RECEPTION: StatutSim.EN_STOCK,
    TypeMouvementSim.VENTE: StatutSim.ASSIGNEE,
    TypeMouvementSim.ACTIVATION: StatutSim.ACTIVE,
    TypeMouvementSim.RETOUR: StatutSim.RETOURNEE,
    TypeMouvementSim.PERTE: StatutSim.PERDUE,
}


def _get_pos(db: Session, partner_id: int, pos_id: int) -> POS:
    pos = db.query(POS).filter(POS.id == pos_id, POS.partner_id == partner_id).first()
    if not pos:
        raise NotFoundError("POS introuvable dans ce Partenaire.")
    return pos


def _decrement_stock(db: Session, pos: POS, quantity: int = 1) -> None:
    """
    Decroche une unite de stock_actuel du POS a chaque nouvelle SIM
    creee au stock de ce POS (approvisionnement consomme une ligne du
    stock alloue). Bloque si le stock est epuise.
    """
    if pos.stock_actuel <= 0:
        raise ValidationErrorApp(
            f"Stock SIM epuise pour le POS '{pos.code_pos}' ({pos.stock_actuel} restantes). "
            "Impossible de creer une nouvelle SIM."
        )
    pos.stock_actuel -= quantity
    db.add(pos)
    db.commit()
    db.refresh(pos)


def create_sim(db: Session, *, partner_id: int, user_id: int, data: dict) -> SIM:
    if get_by_iccid(db, data["iccid"]):
        raise ConflictError(f"L'ICCID '{data['iccid']}' existe deja.", field="iccid")

    pos = _get_pos(db, partner_id, data["pos_id"])
    _decrement_stock(db, pos)

    sim = sim_crud.create(db, {**data, "partner_id": partner_id, "status": StatutSim.EN_STOCK})
    audit_service.log_action(
        db, user_id=user_id, partner_id=partner_id, action="SIM_CREATE",
        entity_type="SIM", entity_id=sim.id, details=f"SIM {sim.iccid} ajoutee au stock",
    )
    return sim


def get_sim_in_partner(db: Session, partner_id: int, sim_id: int) -> SIM:
    sim = sim_crud.get(db, sim_id)
    if not sim or sim.partner_id != partner_id:
        raise NotFoundError("SIM introuvable dans ce Partenaire.")
    return sim


def record_movement(db: Session, *, partner_id: int, user_id: int, sim_id: int,
                     movement_type: str, comment: str | None) -> SIMMovement:
    """
    Enregistre un mouvement de stock SIM (reception, vente, activation,
    retour, perte) et fait evoluer le statut de la SIM en consequence.
    """
    sim = get_sim_in_partner(db, partner_id, sim_id)

    if movement_type == TypeMouvementSim.ACTIVATION.value and sim.status not in (
        StatutSim.ASSIGNEE.value, StatutSim.ASSIGNEE,
    ):
        raise ValidationErrorApp("Seule une SIM assignee peut etre activee.")

    movement = sim_movement_crud.create(db, {
        "sim_id": sim.id,
        "partner_id": partner_id,
        "movement_type": movement_type,
        "author_id": user_id,
        "comment": comment,
    })

    new_status = _MOVEMENT_TO_STATUS.get(TypeMouvementSim(movement_type))
    if new_status:
        sim.status = new_status
        db.add(sim)
        db.commit()
        db.refresh(sim)

    audit_service.log_action(
        db, user_id=user_id, partner_id=partner_id, action="SIM_MOVEMENT",
        entity_type="SIM", entity_id=sim.id, details=f"Mouvement {movement_type} sur SIM {sim.iccid}",
    )
    return movement


def update_status(db: Session, *, partner_id: int, user_id: int, sim_id: int, status: str) -> SIM:
    sim = get_sim_in_partner(db, partner_id, sim_id)
    sim.status = status
    db.add(sim)
    db.commit()
    db.refresh(sim)

    audit_service.log_action(
        db, user_id=user_id, partner_id=partner_id, action="SIM_STATUS_UPDATE",
        entity_type="SIM", entity_id=sim.id, details=f"Nouveau statut : {status}",
    )
    return sim


def reconduire_sim(db: Session, *, partner_id: int, user_id: int, sim_id: int,
                   new_pos_id: int, motif: str | None = None) -> SIM:
    """
    Reconduction SIM : reaffecte la carte a un nouveau POS du meme
    Partenaire et trace un mouvement RECEPTION sur le POS destinataire.
    """
    sim = get_sim_in_partner(db, partner_id, sim_id)
    if sim.pos_id == new_pos_id:
        raise ValidationErrorApp("La SIM est deja rattachee a ce POS.", field="new_pos_id")

    old_pos = sim.pos
    new_pos = _get_pos(db, partner_id, new_pos_id)

    sim.pos_id = new_pos.id
    db.add(sim)
    db.commit()
    db.refresh(sim)

    sim_movement_crud.create(db, {
        "sim_id": sim.id,
        "partner_id": partner_id,
        "movement_type": TypeMouvementSim.RECEPTION.value,
        "author_id": user_id,
        "comment": motif or f"Reconduction SIM vers {new_pos.code_pos} (depuis {old_pos.code_pos})",
    })

    audit_service.log_action(
        db, user_id=user_id, partner_id=partner_id, action="SIM_RECONDUCTION",
        entity_type="SIM", entity_id=sim.id,
        details=f"SIM {sim.iccid} reaffectee au POS {new_pos.code_pos}",
    )
    return sim
