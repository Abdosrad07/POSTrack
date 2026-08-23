"""Vérification rapide du seed de démonstration (lecture seule)."""
import sqlite3

con = sqlite3.connect("postrack.db")
q = lambda s: con.execute(s).fetchone()[0]

print("partners   :", q("SELECT COUNT(*) FROM partners"))
print("dsm        :", q("SELECT COUNT(*) FROM dsm"))
print("pos_actifs :", q("SELECT COUNT(*) FROM pos WHERE status='ACTIF'"))
print("sims       :", q("SELECT COUNT(*) FROM sims"))
print("bts        :", q("SELECT COUNT(*) FROM bts"))
print("requetes   :", q("SELECT COUNT(*) FROM requetes"))
print("---")
for row in con.execute(
    "SELECT external_id, type_requete, nombre_demande, entite_en_charge,"
    " DATE(date_creation) FROM requetes ORDER BY id"
):
    print("REQ:", row)
cols = [r[1] for r in con.execute("PRAGMA table_info(requetes)")]
print("col entite_en_charge :", "OK" if "entite_en_charge" in cols else "ABSENTE")
print("alembic version      :", con.execute(
    "SELECT version_num FROM alembic_version").fetchone()[0])
con.close()
