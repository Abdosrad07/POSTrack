"""
Import des fichiers Excel des partenaires (Master Color, Glothelo, ...) dans POSTrack (SQLite).

Usage :
    python import_pos.py --dry-run   # rapport seul, rien en base
    python import_pos.py --commit    # ecriture reelle
"""
import argparse
import sqlite3
import sys
import csv
from datetime import date
import pandas as pd

DB_PATH = "../postrack.db"

# Chaque entree = un fichier a importer.
# code_partenaire doit deja exister dans la table partenaires (voir seed.sql).
# prefixe_code_pos sert a generer des code_pos distincts par partenaire
# (POS-MC-000001, POS-GL-000001, ...) pour ne jamais melanger les compteurs.
FICHIERS = {
    "master_color_juin": {
        "chemin": "MASTER_COLOR_JUILLET_2026.xlsx",
        "has_numero_pos": False,
        "date_creation": "2026-06-01",
        "code_partenaire": "PART-MC",
        "prefixe_code_pos": "POS-MC-",
    },
    "master_color_juillet": {
        "chemin": "MASTER_COLOR_JUILLET_2026.xlsx",
        "has_numero_pos": True,
        "date_creation": "2026-07-01",
        "code_partenaire": "PART-MC",
        "prefixe_code_pos": "POS-MC-",
    },
    # Glothelo : la structure est prete. Il suffira d'ajouter une entree ici
    # (chemin du fichier reel + date) quand le fichier arrivera. Le code_partenaire
    # 'PART-GL' existe deja dans partenaires (voir seed.sql), donc rien d'autre
    # a changer.
    # "glothelo_xxx": {
    #     "chemin": "glothelo_xxx.xlsx",
    #     "has_numero_pos": True,   # a verifier une fois le fichier recu
    #     "date_creation": "2026-XX-01",
    #     "code_partenaire": "PART-GL",
    #     "prefixe_code_pos": "POS-GL-",
    # },
}


def get_partenaire_id(cur, code_partenaire):
    """Le partenaire doit deja exister (cree dans seed.sql). On ne le cree plus a la volee."""
    cur.execute("SELECT id FROM partenaires WHERE code_partenaire = ?", (code_partenaire,))
    row = cur.fetchone()
    if not row:
        raise ValueError(
            f"Partenaire '{code_partenaire}' introuvable. "
            f"Ajoute-le d'abord dans partenaires (voir seed.sql)."
        )
    return row[0]


def get_or_create_dsm_provisoire(cur, telephone):
    telephone = str(telephone)
    cur.execute("SELECT id FROM dsm WHERE telephone = ?", (telephone,))
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute(
        "INSERT INTO dsm (matricule, nom_complet, telephone, est_provisoire) VALUES (?, ?, ?, 1)",
        (f"DSM-TEMP-{telephone}", "DSM a identifier (import)", telephone),
    )
    return cur.lastrowid


def pos_deja_importe(cur, numero_pos, nom, quartier):
    """Empeche les doublons si le script est relance deux fois."""
    if numero_pos:
        cur.execute("SELECT id FROM pos WHERE numero_pos = ?", (numero_pos,))
    else:
        cur.execute("SELECT id FROM pos WHERE nom = ? AND quartier = ?", (nom, quartier))
    return cur.fetchone() is not None


def prochain_code_pos(cur, prefixe):
    """
    Compte uniquement les POS qui portent DEJA ce prefixe precis
    (ex: 'POS-MC-'), pour que chaque partenaire ait sa propre numerotation
    et que Master Color et Glothelo ne se marchent jamais dessus.
    """
    cur.execute("SELECT COUNT(*) FROM pos WHERE code_pos LIKE ?", (prefixe + "%",))
    n = cur.fetchone()[0]
    return f"{prefixe}{n + 1:06d}"


def traiter_fichier(cur, config, rapport):
    chemin = config["chemin"]
    has_numero_pos = config["has_numero_pos"]
    date_creation = config["date_creation"]
    partenaire_id = get_partenaire_id(cur, config["code_partenaire"])
    prefixe = config["prefixe_code_pos"]

    # Les fichiers ont une ligne vide au-dessus de l'en-tete reel.
    df = pd.read_excel(chemin, header=1)
    df.columns = [str(c).strip() for c in df.columns]

    for i, row in df.iterrows():
        ligne = i + 3  # +2 pour l'en-tete saute, +1 pour compter depuis 1
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
                rapport.append({"fichier": chemin, "ligne": ligne, "statut": "IGNORE (deja importe)", "nom": nom_titulaire})
                continue

            dsm_id = get_or_create_dsm_provisoire(cur, int(dsm_tel))
            code_pos = prochain_code_pos(cur, prefixe)

            cur.execute(
                """INSERT INTO pos
                   (code_pos, nom, quartier, lieu_dit, numero_pos, contact_secondaire,
                    montant_initial, notes, partenaire_id, dsm_id, date_creation)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (code_pos, nom, quartier, lieu_dit, numero_pos, contact_secondaire,
                 montant, observations, partenaire_id, dsm_id, date_creation),
            )
            pos_id = cur.lastrowid
            cur.execute(
                "INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES ('CREATE','POS',?,?)",
                (pos_id, f"Import depuis {chemin}, ligne {ligne}"),
            )
            rapport.append({"fichier": chemin, "ligne": ligne, "statut": "OK", "code_pos": code_pos, "nom": nom})
        except Exception as exc:
            rapport.append({"fichier": chemin, "ligne": ligne, "statut": f"REJETE : {exc}", "nom": row.get("Noms et Prenoms POS", "?")})


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--commit", action="store_true")
    args = parser.parse_args()
    if not args.dry_run and not args.commit:
        print("Precise --dry-run ou --commit")
        sys.exit(1)

    conn = sqlite3.connect(":memory:" if args.dry_run else DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    if args.dry_run:
        conn.executescript(open("../schema.sql").read())
        conn.executescript(open("../seed.sql").read())
    cur = conn.cursor()

    rapport = []
    for label, config in FICHIERS.items():
        traiter_fichier(cur, config, rapport)

    ok = sum(1 for r in rapport if r["statut"] == "OK")
    rejetes = sum(1 for r in rapport if r["statut"].startswith("REJETE"))

    if args.commit:
        conn.commit()
        print(f"{ok} POS importes en base. {rejetes} ligne(s) rejetee(s).")
    else:
        conn.rollback()
        print(f"[DRY-RUN] {ok} POS seraient importes, {rejetes} ligne(s) seraient rejetees.")

    with open(f"rapport_import_{date.today():%Y%m%d}.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["fichier", "ligne", "statut", "code_pos", "nom"])
        writer.writeheader()
        for r in rapport:
            writer.writerow(r)

    conn.close()


if __name__ == "__main__":
    main()