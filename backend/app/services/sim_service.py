"""Mouvements de stock SIM et assignation a un Client."""
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError, ValidationErrorApp
from app.crud.sim_crud import sim_crud, sim_movement_crud, get_by_iccid
from app.crud.client_crud import client_crud
from app.models.sim import SIM, StatutSim, TypeMouvementSim, SIMMovement
from app.services import audit_service

# Transitions de statut induites par chaque type de mouvement de stock
# (P1 - roadmap backend, mouvement complet au-dela de l'assignation).
_MOVEMENT_TO_STATUS = {
    TypeMouvementSim.RECEPTION: StatutSim.EN_STOCK,
    TypeMouvementSim.VENTE: StatutSim.ASSIGNEE,
    TypeMouvementSim.ACTIVATION: StatutSim.ACTIVE,
    TypeMouvementSim.RETOUR: StatutSim.RETOURNEE,
    TypeMouvementSim.PERTE: StatutSim.PERDUE,
}


def create_sim(db: Session, *, partner_id: int, user_id: int, data: dict) -> SIM:
    if get_by_iccid(db, data["iccid"]):
        raise ConflictError(f"L'ICCID '{data['iccid']}' existe deja.", field="iccid")

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


def assign_sim(db: Session, *, partner_id: int, user_id: int, sim_id: int, client_id: int) -> SIM:
    sim = get_sim_in_partner(db, partner_id, sim_id)
    client = client_crud.get(db, client_id)
    if not client or client.partner_id != partner_id:
        raise NotFoundError("Client introuvable dans ce Partenaire.")
    if client.pos_id != sim.pos_id:
        raise ValidationErrorApp("Le Client doit etre rattache au meme POS que la SIM.")

    sim.client_id = client.id
    sim.status = StatutSim.ASSIGNEE
    db.add(sim)
    db.commit()
    db.refresh(sim)

    audit_service.log_action(
        db, user_id=user_id, partner_id=partner_id, action="SIM_ASSIGN",
        entity_type="SIM", entity_id=sim.id, details=f"SIM {sim.iccid} assignee au client {client.id}",
    )
    return sim


def record_movement(db: Session, *, partner_id: int, user_id: int, sim_id: int,
                     movement_type: str, comment: str | None) -> SIMMovement:
    """
    Enregistre un mouvement de stock SIM (reception, vente, activation,
    retour, perte) et fait evoluer le statut de la SIM en consequence,
    de maniere coherente et auditee.
    """
    sim = get_sim_in_partner(db, partner_id, sim_id)

    if movement_type == TypeMouvementSim.VENTE.value and not sim.client_id:
        raise ValidationErrorApp("Une vente necessite que la SIM soit deja assignee a un Client.")
    if movement_type == TypeMouvementSim.ACTIVATION.value and sim.status not in (
        StatutSim.ASSIGNEE.value, StatutSim.ASSIGNEE,
    ):
        raise ValidationErrorApp("Seule une SIM assignee a un Client peut etre activee.")

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
        if new_status in (StatutSim.RETOURNEE, StatutSim.PERDUE):
            sim.client_id = None
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
    if status != StatutSim.ASSIGNEE.value:
        sim.client_id = None
    db.add(sim)
    db.commit()
    db.refresh(sim)

    audit_service.log_action(
        db, user_id=user_id, partner_id=partner_id, action="SIM_STATUS_UPDATE",
        entity_type="SIM", entity_id=sim.id, details=f"Nouveau statut : {status}",
    )
    return sim
