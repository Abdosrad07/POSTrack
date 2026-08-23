"""Ajout de partners.bts_import_file_path pour l'import BTS interne.

Revision ID: e9a0b1c2d334
Revises: c7d8e9f0a112
Create Date: 2026-08-23
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'e9a0b1c2d334'
down_revision: Union[str, None] = 'c7d8e9f0a112'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('partners') as batch_op:
        batch_op.add_column(sa.Column('bts_import_file_path', sa.String(length=500), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('partners') as batch_op:
        batch_op.drop_column('bts_import_file_path')
