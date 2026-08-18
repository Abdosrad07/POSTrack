"""BTS (Base Transceiver Station) : infrastructure reseau d'un Partenaire."""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class BTS(Base):
    __tablename__ = "bts"
    __table_args__ = (
        # Unicite du code_bts dans le perimetre du Partenaire, au niveau
        # base (cf. meme raisonnement que POS.code_pos) : le glossaire
        # (section 1.7.1) utilise code_bts comme cle de rapprochement,
        # ce qui suppose son unicite par Partenaire.
        UniqueConstraint("partner_id", "code_bts", name="uq_bts_partner_code"),
    )

    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False, index=True)

    code_bts = Column(String(50), nullable=False, index=True)
    operateur = Column(String(100), nullable=True)
    technologie = Column(String(50), nullable=True)
    capacite_max = Column(Float, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    zone = Column(String(150), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    partner = relationship("Partner")
    releves = relationship("BTSReleve", back_populates="bts", cascade="all, delete-orphan",
                            order_by="desc(BTSReleve.date_releve)")
