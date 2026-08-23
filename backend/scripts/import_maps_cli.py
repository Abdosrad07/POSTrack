"""Prépare un fichier interne sécurisé pour un import BTS futur (usage CLI local).

Usage :
    .\\venv\\Scripts\\python scripts\\import_maps_cli.py "<URL>" [--add]

Le chemin du fichier est stocké sur partners.bts_import_file_path et n'est jamais journalisé.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.database import SessionLocal
from app.models.user import User
from app.services.bts_maps_service import store_partner_import_file


def main() -> int:
    args = [a for a in sys.argv[1:] if a != "--add"]
    if not args:
        print("Usage: python scripts/import_maps_cli.py \"<chemin_fichier_interne>\"")
        return 2
    file_path = args[0].strip()

    db = SessionLocal()
    try:
        actor = db.query(User).filter(User.role == "ADMIN").first()
        if actor is None:
            print("Aucun utilisateur ADMIN en base : lancez d'abord le seed.")
            return 1
        partner = store_partner_import_file(
            db, partner_id=1, file_path=file_path, file_name=file_path.split('\\')[-1],
        )
        print(f"Fichier interne enregistré pour le partenaire {partner.id} : {partner.bts_import_file_path}")
        return 0
    except Exception as exc:
        print(f"Échec de l'import : {exc}")
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
