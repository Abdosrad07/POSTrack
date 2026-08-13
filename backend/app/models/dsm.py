from datetime import date
from sqlalchemy import String, Date, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.common import TimestampMixin
from app.models.enums import StatutDSM


class DSM(Base, TimestampMixin):
    __tablename__ = "dsm"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=True)
    matricule: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    nom_complet: Mapped[str] = mapped_column(String(255), nullable=False)
    zone_couverture: Mapped[str] = mapped_column(String(255), nullable=False)
    telephone: Mapped[str] = mapped_column(String(20), nullable=True)
    email: Mapped[str] = mapped_column(String(255), nullable=True)
    date_affectation: Mapped[date] = mapped_column(Date, nullable=True)
    statut: Mapped[StatutDSM] = mapped_column(Enum(StatutDSM), default=StatutDSM.ACTIF, nullable=False)

    user: Mapped["User"] = relationship(back_populates="dsm_profile")
    pos_list: Mapped[list["POS"]] = relationship(back_populates="dsm")
