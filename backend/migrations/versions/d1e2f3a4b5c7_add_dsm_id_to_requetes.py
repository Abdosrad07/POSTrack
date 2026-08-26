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
    op.add_column('requetes', sa.Column('dsm_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_requetes_dsm_id'), 'requetes', ['dsm_id'], unique=False)
    op.create_foreign_key('fk_requetes_dsm_id', 'requetes', 'dsm', ['dsm_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint('fk_requetes_dsm_id', 'requetes', type_='foreignkey')
    op.drop_index(op.f('ix_requetes_dsm_id'), table_name='requetes')
    op.drop_column('requetes', 'dsm_id')