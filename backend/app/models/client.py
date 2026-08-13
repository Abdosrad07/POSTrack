from datetime import date
from sqlalchemy import String, Date, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.common import TimestampMixin
from app.models.enums import StatutClient, TypePiece


class Client(Base, TimestampMixin):
    __tablename__ = "clients"

    id: Mapped[int] = mapped_column(primary_key=True)
    code_client: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    nom_complet: Mapped[str] = mapped_column(String(255), nullable=False)
    telephone: Mapped[str] = mapped_column(String(20), nullable=True)
    numero_piece_identite: Mapped[str] = mapped_column(String(50), nullable=True)
    type_piece: Mapped[TypePiece] = mapped_column(Enum(TypePiece), nullable=True)
    pos_id: Mapped[int] = mapped_column(ForeignKey("pos.id"), nullable=False)
    date_enregistrement: Mapped[date] = mapped_column(Date, nullable=False)
    statut: Mapped[StatutClient] = mapped_column(
        Enum(StatutClient), default=StatutClient.ACTIF, nullable=False
    )
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)

    pos: Mapped["POS"] = relationship(back_populates="clients")
    sims: Mapped[list["SIM"]] = relationship(back_populates="client")
