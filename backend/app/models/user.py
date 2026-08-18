<<<<<<< HEAD
"""Comptes utilisateurs, roles et identite d'authentification."""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
=======
from sqlalchemy import String, Boolean, Enum, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
>>>>>>> origin/dev

from app.core.database import Base
from app.security.permissions import Role


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(80), unique=True, nullable=False, index=True)
    email = Column(String(150), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=True)
    role = Column(SAEnum(Role), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

<<<<<<< HEAD
    # Perimetre selon le role : un PARTENAIRE peut avoir un portefeuille
    # (table d'association), un DSM est rattache a un DSM precis, un
    # POS_HOLDER a un ou plusieurs POS (table d'association).
    dsm_id = Column(Integer, ForeignKey("dsm.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    dsm = relationship("DSM", back_populates="users")
    partner_links = relationship("UserPartner", back_populates="user", cascade="all, delete-orphan")
    pos_links = relationship("UserPOS", back_populates="user", cascade="all, delete-orphan")


class UserPartner(Base):
    """Association Utilisateur <-> Partenaire (portefeuille autorise)."""
    __tablename__ = "user_partners"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False)

    user = relationship("User", back_populates="partner_links")
    partner = relationship("Partner")


class UserPOS(Base):
    """Association Utilisateur (Detenteur POS) <-> POS autorises."""
    __tablename__ = "user_pos"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pos_id = Column(Integer, ForeignKey("pos.id"), nullable=False)

    user = relationship("User", back_populates="pos_links")
    pos = relationship("POS")
=======
    # --- Liens d'accès métier ---
    # Un représentant partenaire (MANAGER) est rattaché à un seul partenaire
    partenaire_id: Mapped[int] = mapped_column(
        ForeignKey("partenaires.id"), nullable=True
    )
    # Un détenteur POS (VIEWER) est rattaché à un seul POS
    pos_id: Mapped[int] = mapped_column(ForeignKey("pos.id"), nullable=True)

    # Un DSM applicatif (métier) peut être rattaché à un compte utilisateur
    dsm_profile: Mapped["DSM"] = relationship(back_populates="user", uselist=False)
    audit_logs: Mapped[list["AuditLog"]] = relationship(back_populates="user")

    @property
    def dsm_id(self) -> int | None:
        return self.dsm_profile.id if self.dsm_profile else None

>>>>>>> origin/dev
