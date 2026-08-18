from sqlalchemy import String, Boolean, Enum, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.common import TimestampMixin
from app.models.enums import RoleUser


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    nom_complet: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[RoleUser] = mapped_column(Enum(RoleUser), nullable=False)
    actif: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

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

