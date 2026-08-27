"""Coordonnees GPS POS en Float (decimales WGS84).

Les colonnes pos.latitude / pos.longitude etaient declarees Integer :
toute coordonnee saisie (ex. 4.0512) etait tronquee a l'unite (~110 km
d'erreur). Passage en Float pour stocker de vraies coordonnees GPS.

La revision depend des deux tetes pre-existantes (c1d2e3f4a5b6 -> ...
-> e5f6a7b8c9d0 ET la branche d3e4f5a6b7c8) afin de reunifier la chaine
sous une seule tete : `alembic upgrade head` redevient utilisable.

Batch mode requis pour ALTER COLUMN sur SQLite.

Revision ID: b4d6f8a0c2e4
Revises: ('e5f6a7b8c9d0', 'd3e4f5a6b7c8')
Create Date: 2026-08-26
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b4d6f8a0c2e4'
down_revision: Union[str, Sequence[str], None] = ('e5f6a7b8c9d0', 'd3e4f5a6b7c8')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('pos') as batch_op:
        batch_op.alter_column(
            'latitude',
            existing_type=sa.Integer(),
            type_=sa.Float(),
            existing_nullable=True,
            postgresql_using='latitude::double precision',
        )
        batch_op.alter_column(
            'longitude',
            existing_type=sa.Integer(),
            type_=sa.Float(),
            existing_nullable=True,
            postgresql_using='longitude::double precision',
        )


def downgrade() -> None:
    # Le downgrade tronque les decimales (comportement historique).
    with op.batch_alter_table('pos') as batch_op:
        batch_op.alter_column(
            'longitude',
            existing_type=sa.Float(),
            type_=sa.Integer(),
            existing_nullable=True,
            postgresql_using='longitude::integer',
        )
        batch_op.alter_column(
            'latitude',
            existing_type=sa.Float(),
            type_=sa.Integer(),
            existing_nullable=True,
            postgresql_using='latitude::integer',
        )
