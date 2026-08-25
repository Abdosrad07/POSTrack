"""referentiel partenaires reels : date debut contrat + creation Odi et Seven

Revision ID: a1b1c3d4e5f6
Revises: f4b7c1d2e8a3
Create Date: 2026-08-25

Etape 4 - Partenaires reels communiques par le client :
  - Master Color (PART-MC) : debut de contrat 2025-07-01
  - Glothelo (PART-GL)     : debut de contrat 2023-10-23
  - Odi (PART-ODI)         : debut de contrat 2026-09-01  (cree)
  - Seven (PART-SEV)       : debut de contrat 2026-09-01  (cree)

Le partenaire de demonstration "Camtel Express" (PART-001, codes
POS-DEMO-* / POS-R1-*) est desactive (is_active = 0) : il disparait du
referentiel affiche (les ecrans filtrent les partenaires actifs) sans
supprimer les donnees historiques encore rattachees. L'inactivation est
un etat, pas une suppression.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a1b1c3d4e5f6"
down_revision: Union[str, None] = "f4b7c1d2e8a3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1) Nouvelle colonne date de debut de contrat (nullable).
    with op.batch_alter_table("partners") as batch_op:
        batch_op.add_column(sa.Column("contract_start_date", sa.Date(), nullable=True))

    # 2) Dates des partenaires reels existants.
    op.execute("UPDATE partners SET contract_start_date='2025-07-01' WHERE code='PART-MC'")
    op.execute("UPDATE partners SET contract_start_date='2023-10-23' WHERE code='PART-GL'")

    # 3) Desactivation du partenaire de demonstration (pas de suppression).
    op.execute("UPDATE partners SET is_active=0 WHERE code='PART-001' AND is_active=1")

    # 4) Creation de Odi et Seven (gardes idempotentes).
    op.execute(
        "INSERT INTO partners (code, name, is_active, contract_start_date) "
        "SELECT 'PART-ODI', 'Odi', 1, '2026-09-01' "
        "WHERE NOT EXISTS (SELECT 1 FROM partners WHERE code='PART-ODI')"
    )
    op.execute(
        "INSERT INTO partners (code, name, is_active, contract_start_date) "
        "SELECT 'PART-SEV', 'Seven', 1, '2026-09-01' "
        "WHERE NOT EXISTS (SELECT 1 FROM partners WHERE code='PART-SEV')"
    )


def downgrade() -> None:
    op.execute("DELETE FROM partners WHERE code IN ('PART-ODI', 'PART-SEV')")
    op.execute("UPDATE partners SET is_active=1 WHERE code='PART-001'")
    op.execute("UPDATE partners SET contract_start_date=NULL WHERE code IN ('PART-MC', 'PART-GL')")
    with op.batch_alter_table("partners") as batch_op:
        batch_op.drop_column("contract_start_date")