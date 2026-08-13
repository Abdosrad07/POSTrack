"""
Import centralisé des 12 modèles.
IMPORTANT : ce fichier doit être importé (directement ou via Alembic env.py)
avant tout Base.metadata.create_all() ou toute génération de migration,
sinon SQLAlchemy ne peut pas résoudre les relations déclarées en chaînes
(ex: Mapped["POS"]) entre modules.
"""
from app.models.user import User
from app.models.partenaire import Partenaire
from app.models.dsm import DSM
from app.models.pos import POS
from app.models.reconduction import Reconduction
from app.models.prime import Prime
from app.models.client import Client
from app.models.bts import BTS
from app.models.bts_releve import BTSReleve
from app.models.sim import SIM
from app.models.requete import Requete
from app.models.audit import AuditLog

__all__ = [
    "User", "Partenaire", "DSM", "POS", "Reconduction", "Prime",
    "Client", "BTS", "BTSReleve", "SIM", "Requete", "AuditLog",
]
