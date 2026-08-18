"""
Import centralisé des modèles (étendu Jour 8/9 R7).
IMPORTANT : ce fichier doit être importé avant tout Base.metadata.create_all()
pour que SQLAlchemy résolve correctement les relations déclarées en chaînes.
"""
from app.models.user import User
from app.models.partenaire import Partenaire
from app.models.dsm import DSM
from app.models.pos import POS
from app.models.reconduction import Reconduction
from app.models.prime_period import PrimePeriod
from app.models.prime import Prime
from app.models.dsm_commission import DSMCommission
from app.models.client import Client
from app.models.bts import BTS
from app.models.bts_releve import BTSReleve
from app.models.sim import SIM
from app.models.requete import Requete
from app.models.audit import AuditLog

__all__ = [
    "User", "Partenaire", "DSM", "POS", "Reconduction",
    "PrimePeriod", "Prime", "DSMCommission",
    "Client", "BTS", "BTSReleve", "SIM", "Requete", "AuditLog",
]
