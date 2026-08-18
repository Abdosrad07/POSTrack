"""
<<<<<<< HEAD
Regroupe tous les modeles SQLAlchemy afin que Base.metadata les connaisse
au moment de create_all() / Alembic. Importer ce module suffit a charger
l'ensemble du schema.
"""
from app.models.user import User, UserPartner, UserPOS          # noqa: F401
from app.models.partner import Partner                           # noqa: F401
from app.models.dsm import DSM                                   # noqa: F401
from app.models.pos import POS, TypePos, StatutPos               # noqa: F401
from app.models.reconduction import Reconduction                 # noqa: F401
from app.models.pos_performance import POSPerformance            # noqa: F401
from app.models.prime_period import PrimePeriod, StatutPeriode   # noqa: F401
from app.models.prime import Prime, StatutPrime                  # noqa: F401
from app.models.dsm_commission import DSMCommission               # noqa: F401
from app.models.client import Client                              # noqa: F401
from app.models.sim import SIM, StatutSim, SIMMovement, TypeMouvementSim  # noqa: F401
from app.models.bts import BTS                                    # noqa: F401
from app.models.bts_releve import BTSReleve                       # noqa: F401
from app.models.requete import (                                  # noqa: F401
    Requete, RequeteEntite, RequeteCommentaire,
    TypeRequete, PrioriteRequete, StatutRequete,
)
from app.models.import_batch import ImportBatch, EntityTypeImport, StatutImport  # noqa: F401
from app.models.audit import AuditLog                              # noqa: F401
from app.models.revoked_token import RevokedToken                  # noqa: F401
=======
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
>>>>>>> origin/dev
