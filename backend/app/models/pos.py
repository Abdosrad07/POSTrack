from datetime import date
from sqlalchemy import String, Date, Enum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.common import TimestampMixin
from app.models.enums import StatutPOS, TypePOS


class POS(Base, TimestampMixin):
    __tablename__ = "pos"

    id: Mapped[int] = mapped_column(primary_key=True)
    code_pos: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    nom: Mapped[str] = mapped_column(String(255), nullable=False)
    adresse: Mapped[str] = mapped_column(String(255), nullable=True)
    ville: Mapped[str] = mapped_column(String(100), nullable=True)
    region: Mapped[str] = mapped_column(String(100), nullable=True)
    statut: Mapped[StatutPOS] = mapped_column(Enum(StatutPOS), default=StatutPOS.ACTIF, nullable=False)

    # --- Règle métier critique (Vol.1 section 3.3) : NOUVEAU par défaut, bascule
    # définitive vers RECONDUIT via le service pos_service, jamais modifié à la main ---
    type_pos: Mapped[TypePOS] = mapped_column(Enum(TypePOS), default=TypePOS.NOUVEAU, nullable=False)

    partenaire_id: Mapped[int] = mapped_column(ForeignKey("partenaires.id"), nullable=False)
    dsm_id: Mapped[int] = mapped_column(ForeignKey("dsm.id"), nullable=False)
    gestionnaire_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)

    date_creation: Mapped[date] = mapped_column(Date, nullable=False)
    date_expiration: Mapped[date] = mapped_column(Date, nullable=True)
    date_derniere_reconduction: Mapped[date] = mapped_column(Date, nullable=True)

    contact_principal: Mapped[str] = mapped_column(String(255), nullable=True)
    telephone: Mapped[str] = mapped_column(String(20), nullable=True)
    email_contact: Mapped[str] = mapped_column(String(255), nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)

    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    updated_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)

    partenaire: Mapped["Partenaire"] = relationship(back_populates="pos_list")
    dsm: Mapped["DSM"] = relationship(back_populates="pos_list")
    reconductions: Mapped[list["Reconduction"]] = relationship(back_populates="pos")
    prime: Mapped["Prime"] = relationship(back_populates="pos", uselist=False)
    clients: Mapped[list["Client"]] = relationship(back_populates="pos")
    sims: Mapped[list["SIM"]] = relationship(back_populates="pos")
