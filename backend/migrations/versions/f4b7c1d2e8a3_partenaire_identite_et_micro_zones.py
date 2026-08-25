"""identite partenaire (responsable, commercial, MasterSIM) + micro_zones

Revision ID: f4b7c1d2e8a3
Revises: e9a0b1c2d334
Create Date: 2026-08-25

Etape 2 — Base de donnees : enrichit `partners` avec les informations
d'identite attendues par le client pour la "carte d'identite partenaire"
(responsable, contact, ID responsable, commercial, contact, ID, numero
MasterSIM) et cree la table `micro_zones` (une partenaire decoupe son
territoire en micro-zones ; POS/DSM y seront rattaches ulterieurement).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f4b7c1d2e8a3'
down_revision: Union[str, None] = 'e9a0b1c2d334'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Nouvelle table micro_zones (rattachee au partenaire).
    op.create_table(
        'micro_zones',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('partner_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
        sa.ForeignKeyConstraint(['partner_id'], ['partners.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_micro_zones_id'), 'micro_zones', ['id'], unique=False)
    op.create_index(op.f('ix_micro_zones_partner_id'), 'micro_zones', ['partner_id'], unique=False)

    # Enrichissement de partners (tous les champs nullable => aucun INSERT existant casse).
    with op.batch_alter_table('partners') as batch_op:
        batch_op.add_column(sa.Column('responsable_name', sa.String(length=150), nullable=True))
        batch_op.add_column(sa.Column('responsable_contact', sa.String(length=150), nullable=True))
        batch_op.add_column(sa.Column('responsable_user_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('commercial_name', sa.String(length=150), nullable=True))
        batch_op.add_column(sa.Column('commercial_contact', sa.String(length=150), nullable=True))
        batch_op.add_column(sa.Column('commercial_user_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('master_sim_number', sa.String(length=50), nullable=True))
        batch_op.create_foreign_key('fk_partners_responsable_user', 'users', ['responsable_user_id'], ['id'], ondelete='SET NULL')
        batch_op.create_foreign_key('fk_partners_commercial_user', 'users', ['commercial_user_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    with op.batch_alter_table('partners') as batch_op:
        batch_op.drop_constraint('fk_partners_commercial_user', type_='foreignkey')
        batch_op.drop_constraint('fk_partners_responsable_user', type_='foreignkey')
        batch_op.drop_column('master_sim_number')
        batch_op.drop_column('commercial_user_id')
        batch_op.drop_column('commercial_contact')
        batch_op.drop_column('commercial_name')
        batch_op.drop_column('responsable_user_id')
        batch_op.drop_column('responsable_contact')
        batch_op.drop_column('responsable_name')

    op.drop_index(op.f('ix_micro_zones_partner_id'), table_name='micro_zones')
    op.drop_index(op.f('ix_micro_zones_id'), table_name='micro_zones')
    op.drop_table('micro_zones')