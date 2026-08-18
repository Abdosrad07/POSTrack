"""Carte SIM geree dans le stock d'un POS, assignable a un Client."""
import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum as SAEnum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class StatutSim(str, enum.Enum):
    EN_STOCK = "EN_STOCK"
    ACTIVE = "ACTIVE"
    ASSIGNEE = "ASSIGNEE"
    RETOURNEE = "RETOURNEE"
    PERDUE = "PERDUE"


class TypeMouvementSim(str, enum.Enum):
    """Mouvements de stock SIM (au-dela de la simple assignation)."""
    RECEPTION = "RECEPTION"      # entree en stock (approvisionnement)
    VENTE = "VENTE"                # vente au Client (avant activation)
    ACTIVATION = "ACTIVATION"      # mise en service reseau
    RETOUR = "RETOUR"              # retour au stock POS
    PERTE = "PERTE"                 # declaree perdue/volee


class SIM(Base):
    __tablename__ = "sims"
    __table_args__ = (
        # Index composites pour les filtres frequents du module SIM et
        # du Dashboard (comptage EN_STOCK/ASSIGNEE par Partenaire).
        Index("ix_sim_partner_status", "partner_id", "status"),
        Index("ix_sim_partner_pos", "partner_id", "pos_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False, index=True)
    pos_id = Column(Integer, ForeignKey("pos.id"), nullable=False, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)

    iccid = Column(String(30), unique=True, nullable=False, index=True)
    status = Column(SAEnum(StatutSim), nullable=False, default=StatutSim.EN_STOCK)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    pos = relationship("POS")
    client = relationship("Client")
    movements = relationship("SIMMovement", back_populates="sim", cascade="all, delete-orphan",
                              order_by="desc(SIMMovement.created_at)")


class SIMMovement(Base):
    """Historique des mouvements de stock d'une SIM (P1 - roadmap backend)."""
    __tablename__ = "sim_movements"

    id = Column(Integer, primary_key=True, index=True)
    sim_id = Column(Integer, ForeignKey("sims.id"), nullable=False, index=True)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False, index=True)
    movement_type = Column(SAEnum(TypeMouvementSim), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comment = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sim = relationship("SIM", back_populates="movements")
