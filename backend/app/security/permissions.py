"""Matrice de rôles applicatifs et helpers de contrôle d'accès.

Les rôles cibles sont : ADMIN, MANAGER, CHEF_OPERATIONNEL et OPERATIONNEL.
La hiérarchie est basée sur un poids de responsabilité afin d'éviter la
duplication de permissions : CHEF_OPERATIONNEL hérite des capacités de
l'OPERATIONNEL, et ADMIN reste réservé aux actions techniques et correctives.
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


# Rôles autorisés à valider une prime (validation finale réservée à l'ADMIN,
# cf. test_prime_validation_requires_admin_role et note Jour 9).
PRIME_VALIDATION_ROLES = {Role.ADMIN}

# Rôles autorisés à confirmer une reconduction.
RECONDUCTION_ROLES = {Role.ADMIN, Role.CHEF_OPERATIONNEL, Role.OPERATIONNEL}

# Rôles autorisés à lancer un import Excel.
IMPORT_ROLES = {Role.ADMIN, Role.CHEF_OPERATIONNEL, Role.OPERATIONNEL}

# Rôles ayant accès aux écrans d'administration (utilisateurs, audit).
ADMIN_SCREEN_ROLES = {Role.ADMIN}
