from datetime import date
from sqlalchemy import String, Text, Date, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.common import TimestampMixin
from app.models.enums import StatutRequete, PrioriteRequete, TypeRequete


class Requete(Base, TimestampMixin):
    """
    Vol.2 §5.2c : une requête est rattachée à AU PLUS une entité parmi
    Partenaire/POS/BTS/Client selon son type_requete — toutes les FK sont nullable,
    la cohérence (un seul champ renseigné) est vérifiée côté service, pas en DB.
    """
    __tablename__ = "requetes"

    id: Mapped[int] = mapped_column(primary_key=True)
    code_requete: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    type_requete: Mapped[TypeRequete] = mapped_column(Enum(TypeRequete), nullable=False)
    objet: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    statut: Mapped[StatutRequete] = mapped_column(
        Enum(StatutRequete), default=StatutRequete.OUVERTE, nullable=False
    )
    priorite: Mapped[PrioriteRequete] = mapped_column(
        Enum(PrioriteRequete), default=PrioriteRequete.NORMALE, nullable=False
    )

    partenaire_id: Mapped[int] = mapped_column(ForeignKey("partenaires.id"), nullable=True)
    pos_id: Mapped[int] = mapped_column(ForeignKey("pos.id"), nullable=True)
    bts_id: Mapped[int] = mapped_column(ForeignKey("bts.id"), nullable=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"), nullable=True)

    demandeur_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    assigne_a: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)

    date_creation: Mapped[date] = mapped_column(Date, nullable=True)
    date_resolution: Mapped[date] = mapped_column(Date, nullable=True)
