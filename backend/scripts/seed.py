"""
<<<<<<< HEAD
Jeu de donnees de demonstration (Jour 14 - deploiement et presentation
finale). Cree :
  - 1 compte ADMIN, 1 Representant Partenaire, 1 Representant DSM,
    1 Detenteur POS
  - 2 Partenaires de demonstration
  - DSM, POS (Nouveau et Reconduit), Clients, SIM, BTS + releves
  - une PrimePeriod ouverte et un scenario Prime -> Reconduction -> Prime bloquee

Usage :
    python -m scripts.seed
"""
import sys
import os
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, Base, engine
from app import models as _all_models  # noqa: F401
from app.models.user import User, UserPartner, UserPOS
from app.models.partner import Partner
from app.models.dsm import DSM
from app.models.pos import POS, TypePos
from app.models.client import Client
from app.models.sim import SIM, StatutSim
from app.models.bts import BTS
from app.models.bts_releve import BTSReleve
from app.models.prime_period import PrimePeriod, StatutPeriode
from app.security.password import hash_password
from app.security.permissions import Role


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Partner).count() > 0:
            print("Des donnees existent deja : seed ignore (base non vide).")
            return

        # Partenaires
        p1 = Partner(code="PART-001", name="Distributeur Littoral", address="Douala")
        p2 = Partner(code="PART-002", name="Distributeur Centre", address="Yaounde")
        db.add_all([p1, p2])
        db.commit()
        db.refresh(p1)
        db.refresh(p2)

        # DSM
        dsm1 = DSM(matricule="DSM-001", full_name="Awa Ngo", zone="Zone Littoral Nord", partner_id=p1.id)
        dsm2 = DSM(matricule="DSM-002", full_name="Paul Eto'o", zone="Zone Centre", partner_id=p2.id)
        db.add_all([dsm1, dsm2])
        db.commit()
        db.refresh(dsm1)
        db.refresh(dsm2)

        # Utilisateurs
        admin = User(username="admin", email="admin@postrack.cm", full_name="Administrateur POSTrack",
                     hashed_password=hash_password("Admin@2026"), role=Role.ADMIN)
        rep_partenaire = User(username="rep.littoral", email="rep.littoral@postrack.cm",
                               full_name="Representant Distributeur Littoral",
                               hashed_password=hash_password("Partenaire@2026"), role=Role.PARTENAIRE)
        rep_dsm = User(username="dsm.awa", email="dsm.awa@postrack.cm", full_name="Awa Ngo",
                        hashed_password=hash_password("Dsm@2026"), role=Role.DSM, dsm_id=dsm1.id)
        detenteur_pos = User(username="pos.douala01", email="pos.douala01@postrack.cm",
                              full_name="Detenteur POS Douala 01",
                              hashed_password=hash_password("Pos@2026"), role=Role.POS_HOLDER)
        db.add_all([admin, rep_partenaire, rep_dsm, detenteur_pos])
        db.commit()
        for u in (admin, rep_partenaire, rep_dsm, detenteur_pos):
            db.refresh(u)

        db.add(UserPartner(user_id=rep_partenaire.id, partner_id=p1.id))
        db.commit()

        # POS
        today = date.today()
        pos_nouveau = POS(
            code_pos="POS-DLA-001", name="Boutique Akwa", address="Rue de la Joie", zone="Akwa",
            partner_id=p1.id, dsm_id=dsm1.id, holder_user_id=detenteur_pos.id,
            type_pos=TypePos.NOUVEAU, date_creation=today - timedelta(days=10),
            date_expiration=today + timedelta(days=355),
        )
        pos_reconduit = POS(
            code_pos="POS-DLA-002", name="Boutique Bonaberi", address="Axe Bonaberi", zone="Bonaberi",
            partner_id=p1.id, dsm_id=dsm1.id,
            type_pos=TypePos.RECONDUIT, date_creation=today - timedelta(days=400),
            date_expiration=today + timedelta(days=30), date_derniere_reconduction=today - timedelta(days=20),
        )
        db.add_all([pos_nouveau, pos_reconduit])
        db.commit()
        db.refresh(pos_nouveau)
        db.refresh(pos_reconduit)

        db.add(UserPOS(user_id=detenteur_pos.id, pos_id=pos_nouveau.id))
        db.commit()

        # Clients + SIM
        client1 = Client(partner_id=p1.id, pos_id=pos_nouveau.id, full_name="Jean Mballa", phone="699000001")
        db.add(client1)
        db.commit()
        db.refresh(client1)

        sim1 = SIM(partner_id=p1.id, pos_id=pos_nouveau.id, iccid="8923700000000000001", status=StatutSim.EN_STOCK)
        db.add(sim1)
        db.commit()

        # BTS + releve
        bts1 = BTS(partner_id=p1.id, code_bts="BTS-DLA-01", operateur="OperateurX", technologie="4G",
                   capacite_max=1000, latitude=4.0511, longitude=9.7679, zone="Akwa")
        db.add(bts1)
        db.commit()
        db.refresh(bts1)
        db.add(BTSReleve(bts_id=bts1.id, charge=650, taux_saturation=65, rendement=88,
                          commentaire="Releve de demonstration"))
        db.commit()

        # Periode de prime ouverte
        period = PrimePeriod(
            partner_id=p1.id, code="2026-08", label="Aout 2026",
            start_date=today.replace(day=1), end_date=today.replace(day=28),
            status=StatutPeriode.OPEN,
        )
        db.add(period)
        db.commit()

        print("Seed termine avec succes.")
        print("Comptes de demonstration (username / mot de passe) :")
        print("  admin / Admin@2026            (ADMIN)")
        print("  rep.littoral / Partenaire@2026 (Representant Partenaire - PART-001)")
        print("  dsm.awa / Dsm@2026             (Representant DSM - zone Littoral Nord)")
        print("  pos.douala01 / Pos@2026        (Detenteur POS - POS-DLA-001)")
    finally:
        db.close()


if __name__ == "__main__":
    run()
=======
Point d'entrée rétrocompatible — délègue à import_database.py.

Usage (depuis backend/) : python scripts/seed.py [--force]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from import_database import import_data

if __name__ == "__main__":
    force = "--force" in sys.argv
    import_data(force=force)
>>>>>>> origin/dev
