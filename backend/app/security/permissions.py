"""
Matrice de roles applicatifs et helpers de controle d'acces.

Les quatre roles cibles (cf. cahier des charges v3.1-R7) remplacent les
anciens libelles techniques MANAGER / VIEWER :

    ADMIN                -> perimetre global, administration, validation finale
    PARTENAIRE            -> "Representant Partenaire" : reseau d'un ou plusieurs Partenaires
    DSM                    -> "Representant DSM" : zone DSM et POS rattaches
    POS_HOLDER              -> "Detenteur POS" : un ou plusieurs POS autorises

Le controle d'acces est applique a trois niveaux (route API, service
metier, donnee) comme l'exige la documentation fonctionnelle : ce module
ne couvre que le niveau role. Le niveau "donnee" (appartenance au bon
Partenaire) est verifie par les services (voir app/services).
"""
from enum import Enum


class Role(str, Enum):
    ADMIN = "ADMIN"
    PARTENAIRE = "PARTENAIRE"
    DSM = "DSM"
    POS_HOLDER = "POS_HOLDER"


# Roles autorises a valider une prime (F-08 / workflow Primes)
PRIME_VALIDATION_ROLES = {Role.ADMIN}

# Roles autorises a confirmer une reconduction
RECONDUCTION_ROLES = {Role.ADMIN, Role.PARTENAIRE, Role.DSM}

# Roles autorises a lancer un import Excel (le perimetre reel est
# ensuite filtre par PartnerContext dans le service d'import)
IMPORT_ROLES = {Role.ADMIN, Role.PARTENAIRE, Role.DSM, Role.POS_HOLDER}

# Roles ayant acces aux ecrans d'administration (utilisateurs, audit)
ADMIN_SCREEN_ROLES = {Role.ADMIN}
