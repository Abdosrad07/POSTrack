"""Requete multi-entites : demande ou incident remonte du terrain."""
import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum as SAEnum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class TypeRequete(str, enum.Enum):
    AJOUT = "AJOUT"
    RECONDUCTION = "RECONDUCTION"
    DELINKAGE = "DELINKAGE"
    BASCULEMENT = "BASCULEMENT"
    AUTRE = "AUTRE"


class PrioriteRequete(str, enum.Enum):
    BASSE = "BASSE"
    NORMALE = "NORMALE"
    HAUTE = "HAUTE"
    URGENTE = "URGENTE"


class Requete(Base):
    __tablename__ = "requetes"
    __table_args__ = (
        Index("ix_requete_partner_type", "partner_id", "type_requete"),
    )

    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False, index=True)
    dsm_id = Column(Integer, ForeignKey("dsm.id"), nullable=True, index=True)  # DSM demandeur

    # Cle de rapprochement recommandee pour l'import Excel (section 1.7.1
    # du cahier des charges : "Identifiant externe").
    external_id = Column(String(100), nullable=True, index=True)

    # Entite/agence en charge du traitement (ex. "AC Bepanda") — v3.4 §2.4.
    entite_en_charge = Column(String(120), nullable=True)

    type_requete = Column(SAEnum(TypeRequete), nullable=False)
    titre = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    priorite = Column(SAEnum(PrioriteRequete), nullable=False, default=PrioriteRequete.NORMALE)
    date_creation = Column(DateTime(timezone=True), nullable=True)
    nombre_demande = Column(Integer, nullable=False, default=0)
    nombre_effectue = Column(Integer, nullable=False, default=0)
    nombre_rejete = Column(Integer, nullable=False, default=0)
    delai = Column(Integer, nullable=True)
    date_finalisation = Column(DateTime(timezone=True), nullable=True)

    demandeur_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    responsable_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)

    partner = relationship("Partner")
    dsm = relationship("DSM")
    entites = relationship("RequeteEntite", back_populates="requete", cascade="all, delete-orphan")
    commentaires = relationship("RequeteCommentaire", back_populates="requete", cascade="all, delete-orphan")


class RequeteEntite(Base):
    """Rattachement multi-entites d'une Requete (POS, BTS, Client...)."""
    __tablename__ = "requete_entites"

    id = Column(Integer, primary_key=True, index=True)
    requete_id = Column(Integer, ForeignKey("requetes.id"), nullable=False, index=True)
    entity_type = Column(String(30), nullable=False)  # POS, BTS, CLIENT, PARTNER
    entity_id = Column(Integer, nullable=False)

    requete = relationship("Requete", back_populates="entites")


class RequeteCommentaire(Base):
    """Historique des commentaires d'une Requete."""
    __tablename__ = "requete_commentaires"

    id = Column(Integer, primary_key=True, index=True)
    requete_id = Column(Integer, ForeignKey("requetes.id"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    commentaire = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    requete = relationship("Requete", back_populates="commentaires")
