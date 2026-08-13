from datetime import date, datetime
from sqlalchemy import String, Float, Date, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.common import TimestampMixin
from app.models.enums import StatutBTS, Operateur


class BTS(Base, TimestampMixin):
    __tablename__ = "bts"

    id: Mapped[int] = mapped_column(primary_key=True)
    code_bts: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    nom: Mapped[str] = mapped_column(String(255), nullable=False)
    partenaire_id: Mapped[int] = mapped_column(ForeignKey("partenaires.id"), nullable=False)
    operateur: Mapped[Operateur] = mapped_column(Enum(Operateur), nullable=False)
    technologie: Mapped[str] = mapped_column(String(20), nullable=True)  # 2G/3G/4G/5G
    region: Mapped[str] = mapped_column(String(100), nullable=True)
    ville: Mapped[str] = mapped_column(String(100), nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    capacite_max: Mapped[float] = mapped_column(Float, nullable=False)

    # --- Cache mis à jour par bts_service.py à chaque nouveau relevé (Vol.2 §5.4) ---
    dernier_taux_saturation: Mapped[float] = mapped_column(Float, nullable=True)
    dernier_rendement: Mapped[float] = mapped_column(Float, nullable=True)
    date_dernier_releve: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    date_mise_service: Mapped[date] = mapped_column(Date, nullable=True)
    statut: Mapped[StatutBTS] = mapped_column(Enum(StatutBTS), default=StatutBTS.ACTIF, nullable=False)

    partenaire: Mapped["Partenaire"] = relationship(back_populates="bts_list")
    releves: Mapped[list["BTSReleve"]] = relationship(back_populates="bts")
