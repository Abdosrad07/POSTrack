"""add dsm_id to requetes

Revision ID: d1e2f3a4b5c7
Revises: c1d2e3f4a5b6
Create Date: 2026-08-26
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd1e2f3a4b5c7'
down_revision: Union[str, None] = 'c1d2e3f4a5b6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # SQLite ne supporte pas l'ALTER de contraintes : passage par le mode
    # batch (recreation de la table) comme pour structures_geographiques.
    _conn = op.get_bind()
    _req = sa.Table("requetes", sa.MetaData(), autoload_with=_conn)
    with op.batch_alter_table("requetes", copy_from=_req) as batch_op:
        batch_op.add_column(sa.Column('dsm_id', sa.Integer(), nullable=True))
        batch_op.create_index(op.f('ix_requetes_dsm_id'), ['dsm_id'], unique=False)
        batch_op.create_foreign_key('fk_requetes_dsm_id', 'dsm', ['dsm_id'], ['id'])


def downgrade() -> None:
    _conn = op.get_bind()
    _req = sa.Table("requetes", sa.MetaData(), autoload_with=_conn)
    with op.batch_alter_table("requetes", copy_from=_req) as batch_op:
        batch_op.drop_constraint('fk_requetes_dsm_id', type_='foreignkey')
        batch_op.drop_index(op.f('ix_requetes_dsm_id'))
        batch_op.drop_column('dsm_id')