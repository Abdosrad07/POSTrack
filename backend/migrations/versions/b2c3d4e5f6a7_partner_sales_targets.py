"""partner sales targets

Revision ID: b2c3d4e5f6a7
Revises: a1b1c3d4e5f6
Create Date: 2026-08-26
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a1b1c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'partner_sales_targets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('partner_id', sa.Integer(), nullable=False),
        sa.Column('month', sa.Date(), nullable=False),
        sa.Column('creation_target', sa.Integer(), nullable=True),
        sa.Column('redeployment_target', sa.Integer(), nullable=True),
        sa.Column('sell_out_target', sa.Integer(), nullable=True),
        sa.Column('loading_target', sa.Integer(), nullable=True),
        sa.Column('creation_stock_initial', sa.Integer(), nullable=True),
        sa.Column('redeployment_stock_initial', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['partner_id'], ['partners.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_partner_sales_targets_id'), 'partner_sales_targets', ['id'], unique=False)
    op.create_index(op.f('ix_partner_sales_targets_partner_id'), 'partner_sales_targets', ['partner_id'], unique=False)
    op.create_index(op.f('ix_partner_sales_targets_month'), 'partner_sales_targets', ['month'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_partner_sales_targets_month'), table_name='partner_sales_targets')
    op.drop_index(op.f('ix_partner_sales_targets_partner_id'), table_name='partner_sales_targets')
    op.drop_index(op.f('ix_partner_sales_targets_id'), table_name='partner_sales_targets')
    op.drop_table('partner_sales_targets')