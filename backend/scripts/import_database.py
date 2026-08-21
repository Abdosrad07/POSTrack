"""
Importe le jeu de données de l'équipe DB (database/seed.sql) dans backend/postrack.db.

Les données proviennent du dossier database/ et sont adaptées aux modèles SQLAlchemy
du backend (mapping des champs, mots de passe bcrypt, reconduction POS sans trigger SQL).

Usage (depuis backend/) :
    python scripts/import_database.py          # import si base vide
    python scripts/import_database.py --force  # efface et réimporte tout
"""
import argparse
import sys
from datetime import date, datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import text

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.partner import Partner
from app.models.dsm import DSM
from app.models.pos import POS
from app.models.reconduction import Reconduction
from app.models.prime import Prime
from app.models.bts import BTS
from app.models.bts_releve import BTSReleve
from app.models.sim import SIM
from app.models.requete import Requete
from app.models.audit import AuditLog
from app.models.user import RoleUser
from app.models.partner import TypePartenaire, StatutPartenaire
from app.models.dsm import StatutDSM
from app.models.pos import TypePos, StatutPos
from app.models.prime import StatutPrime
from app.models.bts import StatutBTS, Operateur
from app.models.sim import StatutSim
from app.models.requete import TypeRequete, PrioriteRequete
from app.security.password import hash_password


# Comptes frontend (connexion via l'interface)
FRONTEND_USERS = [
    ("admin@postrack.local", "admin123", "Admin Demo (Accès Global)", RoleUser.ADMIN),
    ("manager@postrack.local", "manager123", "Manager Camtel Express (Partenaire)", RoleUser.MANAGER),
    ("manager.mc@postrack.local", "manager123", "Manager Master Color (Partenaire)", RoleUser.MANAGER),
    ("dsm@postrack.local", "dsm123", "Chef Opérationnel Jean Marc (Douala Akwa)", RoleUser.CHEF_OPERATIONNEL),
    ("dsm.mc@postrack.local", "dsm123", "Chef Opérationnel Master Color", RoleUser.CHEF_OPERATIONNEL),
    ("oper@postrack.local", "oper123", "Opérationnel Kiosque Akwa Liberté", RoleUser.OPERATIONNEL),
    ("oper.mc@postrack.local", "oper123", "Opérationnel ALI - NEWBELL", RoleUser.OPERATIONNEL),
]

# Comptes database/seed.sql (référence équipe DB)
DB_TEAM_USERS = [
    ("admin@postrack.cm", "admin123", "Toi (Admin)", RoleUser.ADMIN),
    ("dsm.douala@postrack.cm", "dsm123", "Jean Marc (Chef Opérationnel Douala)", RoleUser.CHEF_OPERATIONNEL),
]


def _pos_notes(categorie=None, montant=None, extra=None):
    parts = []
    if categorie:
        parts.append(f"Catégorie: {categorie}")
    if montant is not None:
        parts.append(f"Montant initial: {montant}")
    if extra:
        parts.append(extra)
    return " | ".join(parts) if parts else None


def clear_all(db):
    """Vide toutes les tables dans l'ordre des clés étrangères."""
    tables = [
        "audit_logs",
        "requetes",
        "sims",
        "bts_releves",
        "primes",
        "reconductions",
        "pos",
        "bts",
        "dsm",
        "partenaires",
        "users",
    ]
    for table in tables:
        db.execute(text(f"DELETE FROM {table}"))
    db.commit()


def import_data(force: bool = False) -> dict:
    if force:
        with engine.connect() as conn:
            conn.execute(text("PRAGMA foreign_keys=OFF;"))
            for table_name in [
                "audit_logs",
                "requetes",
                "sims",
                "bts_releves",
                "primes",
                "reconductions",
                "pos",
                "bts",
                "dsm",
                "partenaires",
                "users",
            ]:
                conn.execute(text(f"DROP TABLE IF EXISTS {table_name};"))
            conn.commit()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    stats = {}
    try:
        if db.query(User).count() > 0 and not force:
            print("Base déjà peuplée. Utilisez --force pour réimporter.")
            return {"skipped": True}

        # --- 1. USERS ---
        users = {}
        for email, password, nom, role in DB_TEAM_USERS + FRONTEND_USERS:
            user = User(
                email=email,
                password_hash=hash_password(password),
                nom_complet=nom,
                role=role,
                actif=True,
            )
            db.add(user)
            db.flush()
            users[email] = user
        stats["users"] = len(users)

        admin = users["admin@postrack.cm"]
        dsm_user = users["dsm.douala@postrack.cm"]

        # --- 2. PARTENAIRES (database/seed.sql) ---
        partenaires_data = [
            dict(id=1, code_partenaire="PART-001", nom="Camtel Express", ville="Douala"),
            dict(id=2, code_partenaire="PART-MC", nom="Master Color", ville=None),
            dict(id=3, code_partenaire="PART-GL", nom="Glothelo", ville=None),
        ]
        partenaires = {}
        for p in partenaires_data:
            obj = Partenaire(
                code_partenaire=p["code_partenaire"],
                nom=p["nom"],
                type_partenaire=TypePartenaire.DISTRIBUTEUR,
                ville=p["ville"],
                statut=StatutPartenaire.ACTIF,
            )
            db.add(obj)
            db.flush()
            partenaires[p["id"]] = obj
        stats["partenaires"] = len(partenaires)

        # --- 3. DSM ---
        dsms_data = [
            dict(id=1, matricule="DSM-DLA-01", nom_complet="Jean Marc", zone="Douala Akwa", tel=None, provisoire=False),
            dict(id=2, matricule="DSM-TEMP-622493002", nom="DSM à identifier (import Master Color)", zone="À identifier", tel="622493002", provisoire=True),
            dict(id=3, matricule="DSM-TEMP-622095909", nom="DSM à identifier (import Master Color)", zone="À identifier", tel="622095909", provisoire=True),
        ]
        dsms = {}
        for d in dsms_data:
            obj = DSM(
                matricule=d["matricule"],
                nom_complet=d["nom_complet"] if not d["provisoire"] else d["nom"],
                zone_couverture=d["zone"],
                telephone=d["tel"],
                statut=StatutDSM.ACTIF,
            )
            db.add(obj)
            db.flush()
            dsms[d["id"]] = obj
        stats["dsm"] = len(dsms)

        # --- 4. POS ---
        pos_list = {}
        demo_pos = [
            dict(id=101, code="POS-DEMO-0001", nom="Kiosque Akwa Liberte", cat="KIOSQUE", part=1, dsm=1),
            dict(id=102, code="POS-DEMO-0002", nom="Boutique Bonanjo Central", cat="BOUTIQUE", part=1, dsm=1),
        ]
        for p in demo_pos:
            obj = POS(
                code_pos=p["code"],
                name=p["nom"],
                partner_id=partenaires[p["part"]].id,
                dsm_id=dsms[p["dsm"]].id,
                type_pos=TypePos.NOUVEAU,
                status=StatutPos.ACTIF,
                date_creation=date.today(),
                date_expiration=date(2026, 12, 31),
                notes=_pos_notes(categorie=p["cat"]),
            )
            db.add(obj)
            db.flush()
            pos_list[p["id"]] = obj

        mc_pos = [
            dict(id=201, code="POS-MC-000001", nom="ALI - NEWBELL", quartier="NEWBELL", lieu="CASINO",
                 tel="674135510", montant=10000, notes="RAS", part=2, dsm=2, dt=date(2026, 6, 1)),
            dict(id=202, code="POS-MC-000002", nom="KAMGA - NEWBELL", quartier="NEWBELL", lieu="GANGUE CARREFOUR SENEGALAISE",
                 tel="676845050", montant=10000, notes="RAS", part=2, dsm=2, dt=date(2026, 6, 1)),
            dict(id=203, code="POS-MC-000003", nom="YOUSSOUF - NEWBELL", quartier="NEWBELL", lieu="MOSQUEE KDD EN ALLANT VERS MONKAM",
                 tel="656361885", montant=10000, notes="RAS", part=2, dsm=3, dt=date(2026, 7, 1), numero="622486897"),
            dict(id=204, code="POS-MC-000004", nom="IDELETTE - NEWBELL", quartier="NEWBELL", lieu="CERCLE MUNICIPAL MONKAM MOSQUEE",
                 tel="696632492", montant=5000, notes="RAS", part=2, dsm=3, dt=date(2026, 7, 1), numero="622486896"),
        ]
        for p in mc_pos:
            adresse = f"{p['quartier']} — {p['lieu']}"
            extra = f"Numéro POS: {p['numero']}" if p.get("numero") else None
            obj = POS(
                name=p["nom"],
                address=adresse,
                status=StatutPos.ACTIF,
                partner_id=partenaires[p["part"]].id,
                dsm_id=dsms[p["dsm"]].id,
                date_expiration=date(2026, 12, 31),
                date_creation=p["dt"],
                notes=_pos_notes(montant=p["montant"], extra=p["notes"] + (f" | {extra}" if extra else "")),
            )
            db.add(obj)
            db.flush()
            pos_list[p["id"]] = obj
        stats["pos"] = len(pos_list)

        # --- 4b. LIENS D'ACCÈS UTILISATEURS (Scope des 4 rôles) ---
        users["manager@postrack.local"].partenaire_id = partenaires[1].id
        users["manager.mc@postrack.local"].partenaire_id = partenaires[2].id
        dsms[1].user_id = users["dsm@postrack.local"].id
        dsms[2].user_id = users["dsm.mc@postrack.local"].id
        users["viewer@postrack.local"].pos_id = pos_list[101].id
        users["viewer.mc@postrack.local"].pos_id = pos_list[201].id
        db.flush()

        # --- 5. RECONDUCTION (POS 102 → RECONDUIT) ---
        recon = Reconduction(
            pos_id=pos_list[102].id,
            date_reconduction=date(2026, 1, 1),
            ancienne_date_expiration=date(2025, 12, 31),
            nouvelle_date_expiration=date(2026, 12, 31),
            motif="Renouvellement annuel effectue avec succes",
        )
        db.add(recon)
        pos_list[102].type_pos = TypePos.RECONDUIT
        pos_list[102].date_derniere_reconduction = date(2026, 1, 1)
        pos_list[102].date_expiration = date(2026, 12, 31)
        stats["reconductions"] = 1

        # --- 6. PRIMES ---
        primes_data = [
            dict(pos=101, statut=StatutPrime.EN_ATTENTE),
            dict(pos=201, statut=StatutPrime.VALIDEE),
            dict(pos=203, statut=StatutPrime.PAYEE),
        ]
        for p in primes_data:
            db.add(
                Prime(
                    pos_id=pos_list[p["pos"]].id,
                    montant=25000.00,
                    date_attribution=date.today(),
                    status=p["statut"],
                )
            )
        stats["primes"] = len(primes_data)

        # --- 7. BTS + RELEVES ---
        bts = BTS(
            code_bts="BTS-DLA-01",
            partenaire_id=partenaires[1].id,
            operateur=Operateur.CAMTEL,
            technologie="4G",
            capacite_max=1000,
            latitude=4.0511,
            longitude=9.7679,
        )
        db.add(bts)
        db.flush()

        releves_data = [
            (datetime(2026, 8, 1, 8, 0), 400, 40.0, 92.5),
            (datetime(2026, 8, 5, 8, 0), 650, 65.0, 89.0),
            (datetime(2026, 8, 10, 8, 0), 820, 82.0, 85.0),
        ]
        for dt, charge, taux, rendement in releves_data:
            db.add(
                BTSReleve(
                    bts_id=bts.id,
                    date_releve=dt,
                    charge_mesuree=charge,
                    taux_saturation=taux,
                    rendement=rendement,
                )
            )
        bts.dernier_taux_saturation = 82.0
        bts.dernier_rendement = 85.0
        bts.date_dernier_releve = datetime(2026, 8, 10, 8, 0)
        stats["bts"] = 1
        stats["bts_releves"] = len(releves_data)

        # --- 8. SIMS ---
        sims_data = [
            ("89237010000000000001", StatutSIM.EN_STOCK, 101),
            ("89237010000000000002", StatutSim.ACTIVE, 101),
            ("89237010000000000003", StatutSim.ASSIGNEE, 101),
            ("89237010000000000004", StatutSim.PERDUE, 102),
            ("89237010000000000005", StatutSim.RETOURNEE, 102),
        ]
        for iccid, statut, pos_id in sims_data:
            db.add(
                SIM(
                    iccid=iccid,
                    operateur=Operateur.CAMTEL,
                    status=statut,
                    pos_id=pos_list[pos_id].id,
                )
            )
        stats["sims"] = len(sims_data)

        # --- 10. REQUETES ---
        db.add(
            Requete(
                code_requete="REQ-0001",
                type_requete=TypeRequete.APPROVISIONNEMENT_SIM,
                objet="Rupture de stock SIM",
                description="Le POS Akwa Liberte n a plus de SIM CAMTEL en stock.",
                partenaire_id=partenaires[1].id,
                pos_id=pos_list[101].id,
                priorite=PrioriteRequete.NORMALE,
                demandeur_id=dsm_user.id,
            )
        )
        stats["requetes"] = 1

        # --- 11. AUDIT LOGS ---
        audit_entries = [
            (admin.id, "CREATE", "POS", pos_list[101].id, "Creation du POS Akwa Liberte"),
            (admin.id, "UPDATE", "POS", pos_list[102].id, "Reconduction du POS Bonanjo Central"),
            (admin.id, "CREATE", "PARTENAIRE", partenaires[2].id, "Creation du partenaire reel Master Color"),
            (admin.id, "CREATE", "PARTENAIRE", partenaires[3].id, "Creation du partenaire reel Glothelo (structure prete, en attente de donnees)"),
        ]
        for user_id, action, entity, entity_id, details in audit_entries:
            db.add(
                AuditLog(
                    user_id=user_id,
                    action=action,
                    entity_type=entity,
                    entity_id=entity_id,
                    details=details,
                )
            )
        stats["audit_logs"] = len(audit_entries)

        db.commit()
        print("Import terminé depuis database/seed.sql :")
        for key, val in stats.items():
            print(f"  - {key}: {val}")
        return stats
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Importe les données database/ dans backend/postrack.db")
    parser.add_argument("--force", action="store_true", help="Efface et réimporte toutes les données")
    args = parser.parse_args()
    import_data(force=args.force)


if __name__ == "__main__":
    main()
