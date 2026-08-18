"""
Énumérations métier — Volume 2, section 5.5.
Centralisées ici pour être réutilisées par tous les modèles ET par les schémas Pydantic.
"""
import enum


class StatutPOS(str, enum.Enum):
    ACTIF = "ACTIF"
    SUSPENDU = "SUSPENDU"
    RENOUVELLEMENT = "RENOUVELLEMENT"
    CLOTURE = "CLOTURE"


class TypePOS(str, enum.Enum):
    NOUVEAU = "NOUVEAU"
    RECONDUIT = "RECONDUIT"


class StatutPartenaire(str, enum.Enum):
    ACTIF = "ACTIF"
    SUSPENDU = "SUSPENDU"
    RESILIE = "RESILIE"


class TypePartenaire(str, enum.Enum):
    DISTRIBUTEUR = "DISTRIBUTEUR"
    MASTER_DEALER = "MASTER_DEALER"
    REVENDEUR = "REVENDEUR"


class StatutDSM(str, enum.Enum):
    ACTIF = "ACTIF"
    INACTIF = "INACTIF"


class StatutBTS(str, enum.Enum):
    ACTIF = "ACTIF"
    MAINTENANCE = "MAINTENANCE"
    HORS_SERVICE = "HORS_SERVICE"


class Operateur(str, enum.Enum):
    MTN = "MTN"
    ORANGE = "ORANGE"
    CAMTEL = "CAMTEL"
    NEXTTEL = "NEXTTEL"


class StatutPrime(str, enum.Enum):
    BROUILLON = "BROUILLON"
    EN_ATTENTE = "EN_ATTENTE"
    VALIDEE = "VALIDEE"
    PAYEE = "PAYEE"
    REJETEE = "REJETEE"


class StatutPeriodePrime(str, enum.Enum):
    OUVERTE = "OUVERTE"
    FERMEE = "FERMEE"


class StatutDSMCommission(str, enum.Enum):
    EN_ATTENTE = "EN_ATTENTE"
    VERSEE = "VERSEE"


class StatutSIM(str, enum.Enum):
    EN_STOCK = "EN_STOCK"
    VENDUE = "VENDUE"
    ACTIVEE = "ACTIVEE"
    DEFECTUEUSE = "DEFECTUEUSE"
    RETOURNEE = "RETOURNEE"


class StatutRequete(str, enum.Enum):
    OUVERTE = "OUVERTE"
    EN_COURS = "EN_COURS"
    EN_ATTENTE = "EN_ATTENTE"
    RESOLUE = "RESOLUE"
    FERMEE = "FERMEE"
    REJETEE = "REJETEE"


class PrioriteRequete(str, enum.Enum):
    BASSE = "BASSE"
    NORMALE = "NORMALE"
    HAUTE = "HAUTE"
    URGENTE = "URGENTE"


class TypeRequete(str, enum.Enum):
    APPROVISIONNEMENT_SIM = "APPROVISIONNEMENT_SIM"
    MAINTENANCE_BTS = "MAINTENANCE_BTS"
    RECLAMATION_CLIENT = "RECLAMATION_CLIENT"
    SUPPORT_POS = "SUPPORT_POS"
    AUTRE = "AUTRE"


class RoleUser(str, enum.Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    DSM = "DSM"
    VIEWER = "VIEWER"


class StatutClient(str, enum.Enum):
    ACTIF = "ACTIF"
    INACTIF = "INACTIF"


class TypePiece(str, enum.Enum):
    CNI = "CNI"
    PASSEPORT = "PASSEPORT"
    CARTE_SEJOUR = "CARTE_SEJOUR"
