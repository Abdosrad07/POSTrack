"""Requete multi-entites : demande ou incident remonte du terrain."""
import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum as SAEnum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class TypeRequete(str, enum.Enum):
    APPROVISIONNEMENT_SIM = "APPROVISIONNEMENT_SIM"
    MAINTENANCE_BTS = "MAINTENANCE_BTS"
    RECLAMATION_CLIENT = "RECLAMATION_CLIENT"
    SUPPORT_POS = "SUPPORT_POS"
    AUTRE = "AUTRE"


class PrioriteRequete(str, enum.Enum):
    BASSE = "BASSE"
    NORMALE = "NORMALE"
    HAUTE = "HAUTE"
    URGENTE = "URGENTE"


class StatutRequete(str, enum.Enum):
    OUVERTE = "OUVERTE"
    EN_COURS = "EN_COURS"
    EN_ATTENTE = "EN_ATTENTE"
    RESOLUE = "RESOLUE"
    FERMEE = "FERMEE"
    REJETEE = "REJETEE"


class Requete(Base):
    __tablename__ = "requetes"
    __table_args__ = (
        # Filtre le plus frequent du module Requetes (liste des requetes
        # ouvertes/en cours d'un Partenaire, comptage du Dashboard).
        Index("ix_requete_partner_statut", "partner_id", "statut"),
    )

    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False, index=True)

    # Cle de rapprochement recommandee pour l'import Excel (section 1.7.1
    # du cahier des charges : "Identifiant externe").
    external_id = Column(String(100), nullable=True, index=True)

    type_requete = Column(SAEnum(TypeRequete), nullable=False)
    titre = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    priorite = Column(SAEnum(PrioriteRequete), nullable=False, default=PrioriteRequete.NORMALE)
    statut = Column(SAEnum(StatutRequete), nullable=False, default=StatutRequete.OUVERTE)

    demandeur_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    responsable_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)

    partner = relationship("Partner")
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
    """Historique des commentaires / changements de statut d'une Requete."""
    __tablename__ = "requete_commentaires"

    id = Column(Integer, primary_key=True, index=True)
    requete_id = Column(Integer, ForeignKey("requetes.id"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    statut_apres = Column(SAEnum(StatutRequete), nullable=True)
    commentaire = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    requete = relationship("Requete", back_populates="commentaires")
