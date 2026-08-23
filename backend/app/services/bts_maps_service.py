"""Gestion d'un import BTS à partir d'un fichier interne sécurisé.

Le service conserve uniquement la référence serveur au fichier déposé.
Le contenu du fichier n'est jamais exposé côté API. Ce module ne fait pas
le parsing métier des BTS : il assure la validation basique, la persistance
du chemin sécurisé et la compatibilité avec les contrôles d'accès.
"""

from pathlib import Path

from sqlalchemy.orm import Session

from app.core.errors import ValidationErrorApp
from app.models.partner import Partner

_ALLOWED_IMPORT_EXTENSIONS = {".kml", ".kmz", ".csv", ".xlsx", ".xls"}


def validate_internal_import_filename(filename: str) -> str:
    cleaned = (filename or "").strip()
    if not cleaned:
        raise ValidationErrorApp("Le nom du fichier d'import est requis.")
    suffix = Path(cleaned).suffix.lower()
    if suffix not in _ALLOWED_IMPORT_EXTENSIONS:
        raise ValidationErrorApp(
            "Format d'import BTS non supporté. Utilisez un fichier KML, KMZ, CSV ou Excel."
        )
    return cleaned


def parse_kml_placemarks(kml_bytes: bytes) -> list[dict]:
    raise ValidationErrorApp("Le parsing de fichier interne BTS n'est pas implémenté dans ce point de terminaison.")


def store_partner_import_file(db: Session, *, partner_id: int, file_path: str, file_name: str) -> Partner:
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise ValidationErrorApp("Partenaire de contexte introuvable.")
    validate_internal_import_filename(file_name)
    partner.bts_import_file_path = (file_path or "").strip()
    if not partner.bts_import_file_path:
        raise ValidationErrorApp("Le chemin sécurisé du fichier d'import est requis.")
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return partner