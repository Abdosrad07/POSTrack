"""
Import des fichiers Excel partenaires (database/imports/) dans backend/postrack.db.

Adapté depuis database/imports/import_pos.py pour le schéma SQLAlchemy du backend.

Usage (depuis backend/) :
    python scripts/import_pos.py --dry-run
    python scripts/import_pos.py --commit
"""
import argparse
import csv
import sqlite3
import sys
from datetime import date
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
IMPORTS_DIR = ROOT.parent / "database" / "imports"
DB_PATH = ROOT / "postrack.db"

FICHIERS = {
    "master_color_juin": {
        "chemin": IMPORTS_DIR / "MASTER_COLOR_JUILLET_2026.xlsx",
        "has_numero_pos": False,
        "date_creation": "2026-06-01",
        "code_partenaire": "PART-MC",
        "prefixe_code_pos": "POS-MC-",
    },
    "master_color_juillet": {
        "chemin": IMPORTS_DIR / "MASTER_COLOR_JUILLET_2026.xlsx",
        "has_numero_pos": True,
        "date_creation": "2026-07-01",
        "code_partenaire": "PART-MC",
        "prefixe_code_pos": "POS-MC-",
    },
}


def get_partenaire_id(cur, code_partenaire):
    cur.execute("SELECT id FROM partenaires WHERE code_partenaire = ?", (code_partenaire,))
    row = cur.fetchone()
    if not row:
        raise ValueError(
            f"Partenaire '{code_partenaire}' introuvable. "
            "Lancez d'abord : python scripts/import_database.py"
        )
    return row[0]


def get_or_create_dsm_provisoire(cur, telephone):
    telephone = str(telephone)
    cur.execute("SELECT id FROM dsm WHERE telephone = ?", (telephone,))
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute(
        """INSERT INTO dsm (matricule, nom_complet, zone_couverture, telephone, statut)
           VALUES (?, ?, ?, ?, 'ACTIF')""",
        (f"DSM-TEMP-{telephone}", "DSM a identifier (import)", "A identifier", telephone),
    )
    return cur.lastrowid


def pos_deja_importe(cur, numero_pos, nom, quartier):
    if numero_pos:
        cur.execute("SELECT id FROM pos WHERE telephone = ? OR nom = ?", (numero_pos, nom))
    else:
        cur.execute("SELECT id FROM pos WHERE nom = ? AND adresse LIKE ?", (nom, f"%{quartier}%"))
    return cur.fetchone() is not None


def prochain_code_pos(cur, prefixe):
    cur.execute("SELECT COUNT(*) FROM pos WHERE code_pos LIKE ?", (prefixe + "%",))
    n = cur.fetchone()[0]
    return f"{prefixe}{n + 1:06d}"


def traiter_fichier(cur, config, rapport, admin_user_id=1):
    chemin = config["chemin"]
    has_numero_pos = config["has_numero_pos"]
    date_creation = config["date_creation"]
    partenaire_id = get_partenaire_id(cur, config["code_partenaire"])
    prefixe = config["prefixe_code_pos"]

    df = pd.read_excel(chemin, header=1)
    df.columns = [str(c).strip() for c in df.columns]

    for i, row in df.iterrows():
        ligne = i + 3
        try:
            dsm_tel = row["Numeros DSM"]
            nom_titulaire = str(row["Noms et Prenoms POS"]).strip()
            quartier = str(row["Quartiers"]).strip()
            lieu_dit = str(row["Lieu Dit"]).strip()
            contact_secondaire = str(int(row["Autres contact"]))
            montant = float(row["Montant premiere recharges"])
            observations = str(row["Observations"]).strip()
            numero_pos = str(int(row["Numero POS"])) if has_numero_pos else None

            if pd.isna(dsm_tel) or not nom_titulaire:
                raise ValueError("Numeros DSM ou Noms et Prenoms POS manquant")

            nom = f"{nom_titulaire} - {quartier}"
            if pos_deja_importe(cur, numero_pos, nom, quartier):
                rapport.append({"fichier": str(chemin.name), "ligne": ligne, "statut": "IGNORE (deja importe)", "nom": nom_titulaire})
                continue

            dsm_id = get_or_create_dsm_provisoire(cur, int(dsm_tel))
            code_pos = prochain_code_pos(cur, prefixe)
            adresse = f"{quartier} — {lieu_dit}"
            notes = f"Montant initial: {montant} | {observations}"
            if numero_pos:
                notes += f" | Numero POS: {numero_pos}"

            cur.execute(
                """INSERT INTO pos
                   (code_pos, nom, adresse, telephone, notes, partenaire_id, dsm_id,
                    type_pos, statut, date_creation)
                   VALUES (?, ?, ?, ?, ?, ?, ?, 'NOUVEAU', 'ACTIF', ?)""",
                (code_pos, nom, adresse, contact_secondaire, notes, partenaire_id, dsm_id, date_creation),
            )
            pos_id = cur.lastrowid
            cur.execute(
                "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, 'CREATE', 'POS', ?, ?)",
                (admin_user_id, pos_id, f"Import depuis {chemin.name}, ligne {ligne}"),
            )
            rapport.append({"fichier": str(chemin.name), "ligne": ligne, "statut": "OK", "code_pos": code_pos, "nom": nom})
        except Exception as exc:
            rapport.append({"fichier": str(chemin.name), "ligne": ligne, "statut": f"REJETE : {exc}", "nom": row.get("Noms et Prenoms POS", "?")})


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--commit", action="store_true")
    args = parser.parse_args()
    if not args.dry_run and not args.commit:
        print("Precisez --dry-run ou --commit")
        sys.exit(1)

    if args.dry_run:
        if not DB_PATH.exists():
            print(f"Base introuvable : {DB_PATH}. Lancez import_database.py d'abord.")
            sys.exit(1)
        print("[DRY-RUN] Simulation sur la base existante — aucune écriture.")
        conn = sqlite3.connect(DB_PATH)
    else:
        if not DB_PATH.exists():
            print(f"Base introuvable : {DB_PATH}. Lancez import_database.py d'abord.")
            sys.exit(1)
        conn = sqlite3.connect(DB_PATH)

    conn.execute("PRAGMA foreign_keys = ON")
    cur = conn.cursor()

    rapport = []
    for config in FICHIERS.values():
        if not config["chemin"].exists():
            print(f"Fichier absent : {config['chemin']} — ignoré.")
            continue
        traiter_fichier(cur, config, rapport)

    ok = sum(1 for r in rapport if r["statut"] == "OK")
    rejetes = sum(1 for r in rapport if r["statut"].startswith("REJETE"))

    if args.commit:
        conn.commit()
        print(f"{ok} POS importés en base. {rejetes} ligne(s) rejetée(s).")
    else:
        conn.rollback()
        print(f"[DRY-RUN] {ok} POS seraient importés, {rejetes} ligne(s) seraient rejetées.")

    rapport_path = ROOT / "scripts" / f"rapport_import_{date.today():%Y%m%d}.csv"
    with open(rapport_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["fichier", "ligne", "statut", "code_pos", "nom"])
        writer.writeheader()
        for r in rapport:
            writer.writerow(r)
    print(f"Rapport : {rapport_path}")

    conn.close()


if __name__ == "__main__":
    main()
