from datetime import date, datetime
from sqlalchemy import String, Date, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base
from app.models.enums import StatutSIM, Operateur


class SIM(Base):
    __tablename__ = "sims"

    id: Mapped[int] = mapped_column(primary_key=True)
    iccid: Mapped[str] = mapped_column(String(22), unique=True, nullable=False)
    numero_msisdn: Mapped[str] = mapped_column(String(20), nullable=True)
    operateur: Mapped[Operateur] = mapped_column(Enum(Operateur), nullable=False)
    statut: Mapped[StatutSIM] = mapped_column(Enum(StatutSIM), default=StatutSIM.EN_STOCK, nullable=False)
    pos_id: Mapped[int] = mapped_column(ForeignKey("pos.id"), nullable=False)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"), nullable=True)

    date_reception_stock: Mapped[date] = mapped_column(Date, nullable=True)
    date_vente: Mapped[date] = mapped_column(Date, nullable=True)
    date_activation: Mapped[date] = mapped_column(Date, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    pos: Mapped["POS"] = relationship(back_populates="sims")
    client: Mapped["Client"] = relationship(back_populates="sims")
