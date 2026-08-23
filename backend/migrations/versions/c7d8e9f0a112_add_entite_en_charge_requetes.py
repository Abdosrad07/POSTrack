"""Ajout de entite_en_charge sur requetes (v3.4 §2.4)

Revision ID: c7d8e9f0a112
Revises: a1b2c3d4e5f6
Create Date: 2026-08-23

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'c7d8e9f0a112'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('requetes') as batch_op:
        batch_op.add_column(
            sa.Column('entite_en_charge', sa.String(length=120), nullable=True)
        )


def downgrade() -> None:
    with op.batch_alter_table('requetes') as batch_op:
        batch_op.drop_column('entite_en_charge')
