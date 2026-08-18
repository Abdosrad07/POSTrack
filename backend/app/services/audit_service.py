"""Ecriture centralisee du journal d'audit (F-08)."""
from sqlalchemy.orm import Session

from app.models.audit import AuditLog


def log_action(db: Session, *, user_id: int | None, partner_id: int | None,
                action: str, entity_type: str, entity_id: int | None = None,
                details: str | None = None) -> AuditLog:
    entry = AuditLog(
        user_id=user_id,
        partner_id=partner_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
