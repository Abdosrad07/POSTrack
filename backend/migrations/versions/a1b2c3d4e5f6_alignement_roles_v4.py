"""alignement roles v4 : partner_id user, stock POS, SIM sans client, requetes compteurs

Revision ID: a1b2c3d4e5f6
Revises: 5e3e9bad47b9
Create Date: 2026-08-21

- users.partner_id (nullable) : rattachement fixe d'un OPERATIONNEL
- pos.stock_initial / pos.stock_actuel / pos.donnees_additionnelles
- sims.client_id : retire (module Clients supprime)
- requetes : statut retire ; ajout compteurs + dates
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '5e3e9bad47b9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # users.partner_id (OPERATIONNEL rattache a un seul partenaire)
    op.add_column('users', sa.Column('partner_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'users', 'partners', ['partner_id'], ['id'])

    # pos : stock SIM + colonnes additionnelles (import ADMIN)
    op.add_column('pos', sa.Column('stock_initial', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('pos', sa.Column('stock_actuel', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('pos', sa.Column('donnees_additionnelles', sa.JSON(), nullable=True))

    # sims : retire le lien client (module Clients supprime)
    op.drop_constraint('fk_sims_client', 'sims', type_='foreignkey')
    op.drop_column('sims', 'client_id')

    # requetes : retire le statut, ajoute les compteurs
    op.drop_column('requetes', 'statut')
    op.add_column('requetes', sa.Column('date_creation', sa.DateTime(timezone=True), nullable=True))
    op.add_column('requetes', sa.Column('nombre_demande', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('requetes', sa.Column('nombre_effectue', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('requetes', sa.Column('nombre_rejete', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('requetes', sa.Column('delai', sa.Integer(), nullable=True))
    op.add_column('requetes', sa.Column('date_finalisation', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('requetes', 'date_finalisation')
    op.drop_column('requetes', 'delai')
    op.drop_column('requetes', 'nombre_rejete')
    op.drop_column('requetes', 'nombre_effectue')
    op.drop_column('requetes', 'nombre_demande')
    op.drop_column('requetes', 'date_creation')
    op.add_column('requetes', sa.Column('statut', sa.Enum('OUVERTE', 'EN_COURS', 'EN_ATTENTE', 'RESOLUE', 'FERMEE', 'REJETEE', name='statutrequete'), nullable=False))

    op.add_column('sims', sa.Column('client_id', sa.Integer(), nullable=True))
    op.drop_column('pos', 'donnees_additionnelles')
    op.drop_column('pos', 'stock_actuel')
    op.drop_column('pos', 'stock_initial')
    op.drop_column('users', 'partner_id')
