"""
Regles metier POS : creation dans le PartnerContext courant,
transition NOUVEAU -> RECONDUIT (irreversible dans le cadre du MVP)
et gestion des liens Utilisateur <-> POS (detenteur).
"""
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError, ValidationErrorApp
from app.crud.pos_crud import pos_crud, reconduction_crud, get_by_code_in_partner
from app.models.pos import POS, TypePos, LinkageStatus, LinkageStatus
from app.models.dsm import DSM
from app.models.user import User, UserPOS
from app.services import audit_service


def create_pos(db: Session, *, partner_id: int, user_id: int, data: dict) -> POS:
    # Unicite du code POS dans le perimetre du Partenaire
    if get_by_code_in_partner(db, partner_id, data["code_pos"]):
        raise ConflictError(
            f"Le code POS '{data['code_pos']}' existe deja pour ce Partenaire.",
            field="code_pos",
        )

    # Le DSM doit appartenir au meme Partenaire (coherence indirecte)
    dsm = db.query(DSM).filter(DSM.id == data["dsm_id"], DSM.partner_id == partner_id).first()
    if not dsm:
        raise ValidationErrorApp("Le DSM indique n'appartient pas a ce Partenaire.", field="dsm_id")

    if data["date_expiration"] <= data["date_creation"]:
        raise ValidationErrorApp(
            "La date d'expiration doit etre posterieure a la date de creation.",
            field="date_expiration",
        )

    pos = pos_crud.create(db, {**data, "partner_id": partner_id, "type_pos": TypePos.NOUVEAU})

    audit_service.log_action(
        db, user_id=user_id, partner_id=partner_id, action="POS_CREATE",
        entity_type="POS", entity_id=pos.id,
        details=f"Creation du POS {pos.code_pos} (NOUVEAU)",
    )
    return pos


def get_pos_in_partner(db: Session, partner_id: int, pos_id: int) -> POS:
    pos = pos_crud.get(db, pos_id)
    if not pos or pos.partner_id != partner_id:
        raise NotFoundError("POS introuvable dans ce Partenaire.")
    return pos


def reconduire_pos(db: Session, *, partner_id: int, user_id: int, pos_id: int, data: dict):
    """
    Transition NOUVEAU -> RECONDUIT. Irreversible : rejette toute
    tentative sur un POS deja RECONDUIT ou avec une date incoherente.
    """
    pos = get_pos_in_partner(db, partner_id, pos_id)

    if pos.type_pos == TypePos.RECONDUIT:
        raise ConflictError("Ce POS a deja ete reconduit : operation irreversible.")

    if data["new_expiration"] <= pos.date_expiration:
        raise ValidationErrorApp(
            "La nouvelle date d'expiration doit etre posterieure a l'ancienne.",
            field="new_expiration",
        )

    reconduction = reconduction_crud.create(db, {
        "pos_id": pos.id,
        "old_expiration": pos.date_expiration,
        "new_expiration": data["new_expiration"],
        "motif": data.get("motif"),
        "author_id": user_id,
    })

    pos.date_expiration = data["new_expiration"]
    pos.date_derniere_reconduction = reconduction.created_at.date() if reconduction.created_at else data["new_expiration"]
    pos.type_pos = TypePos.RECONDUIT
    db.add(pos)
    db.commit()
    db.refresh(pos)

    audit_service.log_action(
        db, user_id=user_id, partner_id=partner_id, action="POS_RECONDUCTION",
        entity_type="POS", entity_id=pos.id,
        details=f"POS {pos.code_pos} passe a RECONDUIT (nouvelle expiration {data['new_expiration']})",
    )
    return pos, reconduction


def _coerce_target_user(db: Session, partner_id: int, target_user_id: int) -> User:
    """Verifie que l'utilisateur a lier existe et est coherent avec le Partenaire."""
    target = db.query(User).filter(User.id == target_user_id).first()
    if not target or not target.is_active:
        raise NotFoundError("Utilisateur cible introuvable ou desactive.")
    if target.partner_id is not None and target.partner_id != partner_id:
        raise ValidationErrorApp(
            "L'utilisateur indique n'appartient pas a ce Partenaire.",
            field="user_id",
        )
    return target


def lister_liens(db: Session, *, partner_id: int, pos_id: int) -> dict:
    """Etat des liens Utilisateur <-> POS : detenteur courant + associations UserPOS."""
    pos = get_pos_in_partner(db, partner_id, pos_id)
    rows = db.query(UserPOS.user_id).filter(UserPOS.pos_id == pos.id).all()
    return {
        "pos_id": pos.id,
        "holder_user_id": pos.holder_user_id,
        "linked_users": sorted(row[0] for row in rows),
    }


def lier_detenteur(db: Session, *, partner_id: int, actor_id: int, pos_id: int,
                   target_user_id: int) -> POS:
    """
    Link : designe un utilisateur detenteur du POS. Met a jour
    holder_user_id et alimente la table d'association UserPOS (meme
    mecanisme que link_pos a l'inscription).
    """
    pos = get_pos_in_partner(db, partner_id, pos_id)
    target = _coerce_target_user(db, partner_id, target_user_id)

    if pos.holder_user_id == target.id:
        raise ConflictError(
            f"L'utilisateur #{target.id} est deja le detenteur du POS '{pos.code_pos}'."
        )

    pos.holder_user_id = target.id
    db.add(pos)

    exists = db.query(UserPOS).filter(
        UserPOS.user_id == target.id, UserPOS.pos_id == pos.id
    ).first()
    if not exists:
        db.add(UserPOS(user_id=target.id, pos_id=pos.id))
    db.commit()
    db.refresh(pos)

    audit_service.log_action(
        db, user_id=actor_id, partner_id=partner_id, action="POS_LINK",
        entity_type="POS", entity_id=pos.id,
        details=f"Utilisateur #{target.id} lie au POS {pos.code_pos} (detenteur)",
    )
    return pos


def delier_detenteur(db: Session, *, partner_id: int, actor_id: int, pos_id: int,
                     target_user_id: int | None = None) -> POS:
    """
    Unlink : retire le lien Utilisateur <-> POS (holder_user_id remis a
    NULL et lignes UserPOS supprimees). Sans user_id cible, delie tous
    les liens du POS.
    """
    pos = get_pos_in_partner(db, partner_id, pos_id)

    query = db.query(UserPOS).filter(UserPOS.pos_id == pos.id)
    if target_user_id is not None:
        query = query.filter(UserPOS.user_id == target_user_id)
        if pos.holder_user_id not in (None, target_user_id):
            raise ValidationErrorApp(
                f"Le detenteur actuel du POS est l'utilisateur #{pos.holder_user_id}, "
                f"pas #{target_user_id}.",
                field="user_id",
            )

    links = query.all()
    if not links and pos.holder_user_id is None:
        raise ConflictError("Ce POS n'est lie a aucun utilisateur.")

    previous_holder = pos.holder_user_id
    for link in links:
        db.delete(link)
    pos.holder_user_id = None
    db.add(pos)
    db.commit()
    db.refresh(pos)

    audit_service.log_action(
        db, user_id=actor_id, partner_id=partner_id, action="POS_UNLINK",
        entity_type="POS", entity_id=pos.id,
        details=f"Detenteur #{previous_holder} delie du POS {pos.code_pos}",
    )
    return pos
