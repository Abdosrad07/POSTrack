from datetime import date
from sqlalchemy import String, Date, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.common import TimestampMixin
from app.models.enums import StatutPartenaire, TypePartenaire


class Partenaire(Base, TimestampMixin):
    __tablename__ = "partenaires"

    id: Mapped[int] = mapped_column(primary_key=True)
    code_partenaire: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    nom: Mapped[str] = mapped_column(String(255), nullable=False)
    type_partenaire: Mapped[TypePartenaire] = mapped_column(Enum(TypePartenaire), nullable=False)
    region: Mapped[str] = mapped_column(String(100), nullable=True)
    ville: Mapped[str] = mapped_column(String(100), nullable=True)
    adresse: Mapped[str] = mapped_column(String(255), nullable=True)
    contact_principal: Mapped[str] = mapped_column(String(255), nullable=True)
    telephone: Mapped[str] = mapped_column(String(20), nullable=True)
    email: Mapped[str] = mapped_column(String(255), nullable=True)
    date_signature_contrat: Mapped[date] = mapped_column(Date, nullable=True)
    date_fin_contrat: Mapped[date] = mapped_column(Date, nullable=True)
    statut: Mapped[StatutPartenaire] = mapped_column(
        Enum(StatutPartenaire), default=StatutPartenaire.ACTIF, nullable=False
    )
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)

    pos_list: Mapped[list["POS"]] = relationship(back_populates="partenaire")
    bts_list: Mapped[list["BTS"]] = relationship(back_populates="partenaire")
