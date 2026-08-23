"""Seed réaliste v3.4 — simulation CAMTEL Douala.

Données client (18/08/2026) : puce mère 622095908 ; objectifs globaux
40 créations / 610 POS actifs ; 6 DSM listés avec leurs objectifs.
Inclut la requête de simulation « Demande de reconduction : 10 »
(envoyée le 5 août — entité en charge : AC Bépanda).

Usage (depuis backend/) :
    .\\venv\\Scripts\\python -m alembic upgrade head
    .\\venv\\Scripts\\python scripts\\seed_demo_puce.py
"""
import sys
from datetime import date, datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import text

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.partner import Partner
from app.models.dsm import DSM
from app.models.pos import POS, TypePos, StatutPos
from app.models.sim import SIM, StatutSim
from app.models.requete import Requete, TypeRequete, PrioriteRequete
from app.security.permissions import Role
from app.security.password import hash_password

Base.metadata.create_all(bind=engine)

PUCE_MERE = "622095908"
OBJECTIF_GLOBAL_CREATIONS = 40
OBJECTIF_GLOBAL_ACTIFS = 610

# (matricule, nom, quartier, créations, actifs)
DSMS = [
    ("62209590",  "DSM 1 — Bépanda",      "Bépanda",      7, 607),
    ("622095910", "DSM 2 — Akwa",         "Akwa",         7, 607),
    ("622095911", "DSM 3 — Bonabéri",     "Bonabéri",     7, 607),
    ("622092927", "DSM 4 — Bonamoussadi", "Bonamoussadi", 7, 607),
    ("620460454", "DSM 5 — Deïdo",        "Deïdo",        6, 606),
    ("620481320", "DSM 6 — Ndogbong",     "Ndogbong",     6, 606),
]

RUES = ["Boulevard de la Liberté", "Rue Njo-Njo", "Avenue des Banques",
        "Rue Kotto", "Route de Douala", "Carrefour Mboppi",
        "Boulevard de l'Unité", "Rue Joss"]

# NB : les BTS ne sont plus seedées ici — elles proviennent désormais d'un
# fichier interne sécurisé d'import du partenaire (voir
# POST /api/partners/{id}/bts/import-maps et bts_maps_service).

# === PARTIE 2 (fonctions) ===

def clear_all(db):
    tables = [
        "requete_commentaires", "requete_entites", "requetes",
        "sim_movements", "sims", "bts_releves", "bts",
        "primes", "reconductions", "pos", "dsm",
        "audit_logs", "import_batches", "users", "partners",
    ]
    db.execute(text("PRAGMA foreign_keys=OFF;"))
    for table in tables:
        try:
            db.execute(text(f"DELETE FROM {table}"))
        except Exception:
            db.rollback()
    db.execute(text("PRAGMA foreign_keys=ON;"))
    db.commit()


def seed():
    db = SessionLocal()
    try:
        clear_all(db)

        admin = User(username="admin", email="admin@postrack.cm",
                     hashed_password=hash_password("admin123"),
                     full_name="Administrateur CAMTEL", role=Role.ADMIN,
                     is_active=True, partner_id=None)
        chef = User(username="chef", email="chef@postrack.cm",
                    hashed_password=hash_password("chef123"),
                    full_name="Chef opérationnel CAMTEL",
                    role=Role.CHEF_OPERATIONNEL, is_active=True, partner_id=None)
        oper = User(username="oper", email="oper@postrack.cm",
                    hashed_password=hash_password("oper123"),
                    full_name="Opérationnel terrain", role=Role.OPERATIONNEL,
                    is_active=True, partner_id=1)
        db.add_all([admin, chef, oper])
        db.flush()

        partner = Partner(
            id=1, code="PART-CAMTEL",
            name="CAMTEL — Centre de Distribution Douala",
            address=(f"Puce mère : {PUCE_MERE} · Objectifs : "
                     f"{OBJECTIF_GLOBAL_CREATIONS} créations / "
                     f"{OBJECTIF_GLOBAL_ACTIFS} POS actifs"),
            is_active=True,
        )
        db.add(partner)
        db.flush()

        pos_rows = []
        code_seq = 1
        for idx, (matricule, full_name, quartier, creations, actifs) in enumerate(DSMS, start=1):
            dsm = DSM(id=idx, matricule=matricule, full_name=full_name,
                      zone=quartier, partner_id=partner.id)
            db.add(dsm)
            db.flush()

            for n in range(actifs):
                is_creation = n < creations
                if is_creation:
                    dc = date(2026, 8, 1 + (n % 20))
                else:
                    dc = date(2025, 1 + (n % 12), 1 + (n % 27))
                pos_rows.append(POS(
                    code_pos=f"POS-CAM-{code_seq:06d}",
                    name=f"{quartier} — Point de vente {n + 1}",
                    address=f"{quartier}, {RUES[n % len(RUES)]}",
                    zone=quartier,
                    partner_id=partner.id,
                    dsm_id=dsm.id,
                    type_pos=TypePos.NOUVEAU if is_creation else TypePos.RECONDUIT,
                    status=StatutPos.ACTIF,
                    stock_initial=30 + (n % 50),
                    stock_actuel=10 + (n % 40),
                    date_creation=dc,
                    date_expiration=date(2026, 12, 31),
                ))
                code_seq += 1
        db.add_all(pos_rows)
        db.flush()
        pos_by_dsm = {}
        for p in pos_rows:
            pos_by_dsm.setdefault(p.dsm_id, []).append(p)
# === PARTIE 3 (SIM, BTS, Requêtes, main) ===

        sims = []
        iccid_seq = 1
        for dsm_id, plist in pos_by_dsm.items():
            for p in plist[:20]:
                for _ in range(2):
                    status = [StatutSim.EN_STOCK, StatutSim.ACTIVE,
                              StatutSim.ASSIGNEE][iccid_seq % 3]
                    sims.append(SIM(
                        partner_id=partner.id,
                        pos_id=p.id,
                        iccid=f"892370{iccid_seq:015d}",
                        status=status,
                    ))
                    iccid_seq += 1
        db.add_all(sims)

        # BTS : importées depuis un fichier interne sécurisé du partenaire
        # (POST /bts/import-maps) — plus aucune BTS factice ici.

        db.add_all([
            Requete(
                partner_id=partner.id,
                external_id="EXT-REQ-RECON-010",
                type_requete=TypeRequete.RECONDUCTION,
                titre="Demande de reconduction",
                description="Reconduction de 10 POS — demande envoyée le 5 août.",
                priorite=PrioriteRequete.HAUTE,
                date_creation=datetime(2026, 8, 5, 10, 30, tzinfo=timezone.utc),
                nombre_demande=10, nombre_effectue=3, nombre_rejete=0,
                delai=72,
                entite_en_charge="AC Bépanda",
                demandeur_id=chef.id,
            ),
            Requete(
                partner_id=partner.id,
                external_id="EXT-REQ-OBJ-0826",
                type_requete=TypeRequete.AUTRE,
                titre="Objectifs du mois — Août 2026",
                description=(f"Créations : {OBJECTIF_GLOBAL_CREATIONS} — "
                             f"POS actifs : {OBJECTIF_GLOBAL_ACTIFS} — "
                             f"Puce mère : {PUCE_MERE}"),
                priorite=PrioriteRequete.NORMALE,
                date_creation=datetime(2026, 8, 1, 8, 0, tzinfo=timezone.utc),
                nombre_demande=OBJECTIF_GLOBAL_CREATIONS,
                entite_en_charge="DSM Direct",
                demandeur_id=admin.id,
            ),
            Requete(
                partner_id=partner.id,
                external_id="EXT-REQ-SIM-012",
                type_requete=TypeRequete.AJOUT,
                titre="Rupture de stock SIM — Akwa",
                description="Réapprovisionner 2 POS du quartier Akwa.",
                priorite=PrioriteRequete.URGENTE,
                date_creation=datetime(2026, 8, 12, 9, 15, tzinfo=timezone.utc),
                nombre_demande=2, nombre_effectue=1, nombre_rejete=0,
                entite_en_charge="AC Akwa",
                demandeur_id=oper.id,
            ),
        ])

        db.commit()

        print("Seed terminé :")
        print(f"  Partenaire : CAMTEL (puce mère {PUCE_MERE})")
        print(f"  DSM        : {len(DSMS)}")
        print(f"  POS actifs : {len(pos_rows)}")
        print(f"  SIM        : {len(sims)}")
        print("  BTS        : importées via fichier interne sécurisé (voir /bts/import-maps)")
        print("  Requêtes   : 3 (dont reconduction x10 — AC Bépanda)")
    finally:
        db.close()


if __name__ == "__main__":
    seed()


