"""Lot d'import Excel : traçabilite depot -> validation -> application."""
import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class EntityTypeImport(str, enum.Enum):
    PARTNER = "PARTNER"
    DSM = "DSM"
    POS = "POS"
    CLIENT = "CLIENT"
    BTS = "BTS"
    BTS_RELEVE = "BTS_RELEVE"
    SIM = "SIM"
    PRIME_PERIOD = "PRIME_PERIOD"
    PRIME = "PRIME"
    REQUETE = "REQUETE"


class StatutImport(str, enum.Enum):
    UPLOADED = "UPLOADED"
    VALIDATING = "VALIDATING"
    VALIDATED = "VALIDATED"
    APPLIED = "APPLIED"
    PARTIAL = "PARTIAL"
    FAILED = "FAILED"


class ImportBatch(Base):
    __tablename__ = "import_batches"

    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False, index=True)
    imported_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    file_name = Column(String(255), nullable=False)
    entity_type = Column(SAEnum(EntityTypeImport), nullable=False)
    status = Column(SAEnum(StatutImport), nullable=False, default=StatutImport.UPLOADED)

    total_rows = Column(Integer, default=0)
    valid_rows = Column(Integer, default=0)
    error_rows = Column(Integer, default=0)
    error_report_path = Column(String(500), nullable=True)
    # Chemin du fichier JSON contenant les lignes valides issues de la
    # validation, relu par apply_import() pour ecrire les donnees en
    # base de maniere transactionnelle (voir import_validation_service).
    valid_rows_path = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    applied_at = Column(DateTime(timezone=True), nullable=True)

    partner = relationship("Partner")
