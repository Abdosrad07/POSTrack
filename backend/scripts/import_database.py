"""Import du jeu de données de démonstration dans la base locale.

Réécrit pour être aligné sur les modèles SQLAlchemy v4 actuels (le rôle est
Role de app.security.permissions, les champs sont code/name pour Partner,
full_name/zone pour DSM, etc.). Délègue le jeu de données à scripts/seed_v4.py
et expose les mêmes points d'entrée (import_database.py / seed.py).

Usage (depuis backend/) :
    python scripts/import_database.py          # import si base vide
    python scripts/import_database.py --force  # vide et réimporte
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.seed_v4 import seed  # noqa: E402


def import_data(force: bool = False) -> dict:
    """Vide (si --force) puis insère le jeu de démonstration v4."""
    if force:
        print("Reconstruction de la base avec le jeu de démonstration v4...")
    else:
        print("Import du jeu de démonstration v4...")

    seed()
    return {"ok": True, "force": force}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Import du jeu de données POSTrack v4")
    parser.add_argument("--force", action="store_true", help="Vide puis réimporte")
    args = parser.parse_args()
    import_data(force=args.force)
    print("Import terminé.")