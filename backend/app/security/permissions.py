"""Matrice de roles applicatifs et helpers de controle d'acces.

Les quatre roles cibles sont : ADMIN, MANAGER, CHEF_OPERATIONNEL et
OPERATIONNEL. La hierarchie est basee sur un poids de responsabilite afin
d'eviter les listes dupliquees : CHEF_OPERATIONNEL herite des capacites de
OPERATIONNEL, et ADMIN reste reserve aux actions techniques et correctives.
"""
from enum import Enum


class Role(str, Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    CHEF_OPERATIONNEL = "CHEF_OPERATIONNEL"
    OPERATIONNEL = "OPERATIONNEL"


ROLE_WEIGHT = {
    Role.OPERATIONNEL: 1,
    Role.CHEF_OPERATIONNEL: 2,
    Role.MANAGER: 3,
    Role.ADMIN: 4,
}


def role_gte(role: Role, minimum: Role) -> bool:
    return ROLE_WEIGHT[role] >= ROLE_WEIGHT[minimum]


# Roles autorises a valider une prime
PRIME_VALIDATION_ROLES = {Role.CHEF_OPERATIONNEL}

# Roles autorises a confirmer une reconduction
RECONDUCTION_ROLES = {Role.ADMIN, Role.CHEF_OPERATIONNEL, Role.OPERATIONNEL}

# Roles autorises a lancer un import Excel
IMPORT_ROLES = {Role.ADMIN, Role.CHEF_OPERATIONNEL, Role.OPERATIONNEL}

# Roles ayant acces aux ecrans d'administration (utilisateurs, audit)
ADMIN_SCREEN_ROLES = {Role.ADMIN}
