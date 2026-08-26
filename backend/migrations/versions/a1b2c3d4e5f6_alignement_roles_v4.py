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
    # SQLite ne supporte pas l'ALTER des contraintes : passage en mode batch
    # (copy-and-move) avec reflection, comme exige par migrations/env.py.
    _conn = op.get_bind()
    _users = sa.Table('users', sa.MetaData(), autoload_with=_conn)
    with op.batch_alter_table('users', copy_from=_users) as batch_op:
        batch_op.create_foreign_key('fk_users_partner', 'partners', ['partner_id'], ['id'])

    # pos : stock SIM + colonnes additionnelles (import ADMIN)
    op.add_column('pos', sa.Column('stock_initial', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('pos', sa.Column('stock_actuel', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('pos', sa.Column('donnees_additionnelles', sa.JSON(), nullable=True))

    # sims : retire le lien client (module Clients supprime).
    # La FK nommee 'fk_sims_client' n'existe que sur certaines bases d'origine
    # (MySQL) : on ne la depose donc que si la reflection l'a trouvee.
    _sims = sa.Table('sims', sa.MetaData(), autoload_with=_conn)
    with op.batch_alter_table('sims', copy_from=_sims) as batch_op:
        if any(getattr(cst, 'name', None) == 'fk_sims_client' for cst in _sims.constraints):
            batch_op.drop_constraint('fk_sims_client', type_='foreignkey')
        batch_op.drop_column('client_id')

    # requetes : retire le statut, ajoute les compteurs
    # L'index composite porte sur statut : il doit partir avant la colonne.
    op.drop_index('ix_requete_partner_statut', table_name='requetes')
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
    op.create_index('ix_requete_partner_statut', 'requetes', ['partner_id', 'statut'])

    op.add_column('sims', sa.Column('client_id', sa.Integer(), nullable=True))
    op.drop_column('pos', 'donnees_additionnelles')
    op.drop_column('pos', 'stock_actuel')
    op.drop_column('pos', 'stock_initial')
    op.drop_column('users', 'partner_id')
