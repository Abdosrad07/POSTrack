"""POS (Point de Vente) : unite commerciale centrale, cycle Nouveau/Reconduit."""
import enum
from sqlalchemy import (
    Column, Integer, String, ForeignKey, DateTime, Date, Enum as SAEnum,
    UniqueConstraint, Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class TypePos(str, enum.Enum):
    NOUVEAU = "NOUVEAU"
    RECONDUIT = "RECONDUIT"


class StatutPos(str, enum.Enum):
    ACTIF = "ACTIF"
    SUSPENDU = "SUSPENDU"
    FERME = "FERME"


class POS(Base):
    __tablename__ = "pos"
    __table_args__ = (
        # Unicite du code_pos dans le perimetre du Partenaire (section
        # 1.6.1 du cahier des charges) -- appliquee au niveau base, pas
        # seulement verifiee cote application, pour eliminer toute
        # fenetre de race condition entre deux creations concurrentes.
        UniqueConstraint("partner_id", "code_pos", name="uq_pos_partner_code"),
        # Index composites pour les filtres les plus frequents du
        # Dashboard et du module POS (cahier des charges section 11 :
        # p95 < 500ms sur un jeu de 10 000 POS).
        Index("ix_pos_partner_type", "partner_id", "type_pos"),
        Index("ix_pos_partner_status", "partner_id", "status"),
        Index("ix_pos_partner_expiration", "partner_id", "date_expiration"),
    )

    id = Column(Integer, primary_key=True, index=True)
    code_pos = Column(String(50), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    address = Column(String(255), nullable=True)
    zone = Column(String(150), nullable=True)

    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False, index=True)
    dsm_id = Column(Integer, ForeignKey("dsm.id"), nullable=False, index=True)
    holder_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    type_pos = Column(SAEnum(TypePos), nullable=False, default=TypePos.NOUVEAU)
    status = Column(SAEnum(StatutPos), nullable=False, default=StatutPos.ACTIF)

    date_creation = Column(Date, nullable=False)
    date_expiration = Column(Date, nullable=False)
    date_derniere_reconduction = Column(Date, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

<<<<<<< HEAD
    partner = relationship("Partner")
    dsm = relationship("DSM")
    holder = relationship("User", foreign_keys=[holder_user_id])
    reconductions = relationship("Reconduction", back_populates="pos", cascade="all, delete-orphan")
    primes = relationship("Prime", back_populates="pos", cascade="all, delete-orphan")
=======
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    updated_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)

    partenaire: Mapped["Partenaire"] = relationship(back_populates="pos_list")
    dsm: Mapped["DSM"] = relationship(back_populates="pos_list")
    reconductions: Mapped[list["Reconduction"]] = relationship(back_populates="pos")
    primes: Mapped[list["Prime"]] = relationship(back_populates="pos")
    clients: Mapped[list["Client"]] = relationship(back_populates="pos")
    sims: Mapped[list["SIM"]] = relationship(back_populates="pos")

>>>>>>> origin/dev
