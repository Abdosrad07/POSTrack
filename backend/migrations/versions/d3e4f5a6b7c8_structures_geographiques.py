"""structures geographiques : polygones de territoire pour micro-zones

Revision ID: d3e4f5a6b7c8
Revises: b2c3d4e5f6a7
Create Date: 2026-08-26

Structure technique permettant l'integration future de geometries reelles
fournies par le client (limites de quartiers / zones) :
  - `micro_zones.boundaries` : polygone GeoJSON (nullable).
  - `partners.territory_geojson` : perimetre global du partenaire (nullable).

AUCUNE geometrie arbitraire n'est injectee ici : les colonnes restent NULL
tant que le client ne fournit pas les contours reels. La carte derive en
attendant l'etendue reelle des points de presence (POS/BTS) cote API.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d3e4f5a6b7c8"
down_revision: Union[str, None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    _conn = op.get_bind()
    _mz = sa.Table("micro_zones", sa.MetaData(), autoload_with=_conn)
    with op.batch_alter_table("micro_zones", copy_from=_mz) as batch_op:
        batch_op.add_column(sa.Column("boundaries", sa.JSON(), nullable=True))

    _p = sa.Table("partners", sa.MetaData(), autoload_with=_conn)
    with op.batch_alter_table("partners", copy_from=_p) as batch_op:
        batch_op.add_column(sa.Column("territory_geojson", sa.JSON(), nullable=True))


def downgrade() -> None:
    _conn = op.get_bind()
    _p = sa.Table("partners", sa.MetaData(), autoload_with=_conn)
    with op.batch_alter_table("partners", copy_from=_p) as batch_op:
        batch_op.drop_column("territory_geojson")

    _mz = sa.Table("micro_zones", sa.MetaData(), autoload_with=_conn)
    with op.batch_alter_table("micro_zones", copy_from=_mz) as batch_op:
        batch_op.drop_column("boundaries")
