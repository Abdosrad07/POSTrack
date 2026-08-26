"""add numero_msisdn to sims

Revision ID: e5f6a7b8c9d0
Revises: d1e2f3a4b5c7
Create Date: 2026-08-26

Le modele SIM expose numero_msisdn depuis le commit "feat(sim): display
phone numbers instead of ICCIDs" mais aucune revision Alembic ne creait la
colonne : toute base initialisee uniquement par les migrations etait
desynchronisee du modele (echec SELECT sur sims). Cette revision comble le
manque ; nullable car une SIM n'a pas forcement encore de MSISDN associe.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'e5f6a7b8c9d0'
down_revision: Union[str, None] = 'd1e2f3a4b5c7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('sims', sa.Column('numero_msisdn', sa.String(length=20), nullable=True))


def downgrade() -> None:
    op.drop_column('sims', 'numero_msisdn')
