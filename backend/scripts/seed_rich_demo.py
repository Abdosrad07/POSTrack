"""Seed riche ADDITIF : complète le jeu minimal de seed_v4 sans rien effacer.

Contrairement à seed_v4.py (destructif), ce script n'ajoute que des lignes
manquantes et peut être relancé sans dupliquer les données :
  - DSM supplémentaires par partenaire
  - POS répartis sur les DSM (types/statuts/dates/coordonnées variés)
  - Historique de reconductions pour les POS RECONDUIT
  - BTS multiples + 14 jours de relevés (charge/saturation/rendement)
  - Stock SIM avec mouvement de réception initial
  - Périodes de primes + primes de création + commissions DSM

Usage (depuis backend/) :
    python scripts/seed_rich_demo.py
"""
import random
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.database import SessionLocal
from app.models.bts import BTS
from app.models.bts_releve import BTSReleve
from app.models.dsm import DSM
from app.models.dsm_commission import DSMCommission, StatutCommission
from app.models.partner import Partner
from app.models.pos import POS, StatutPos, TypePos
from app.models.prime import Prime, StatutPrime
from app.models.prime_period import PrimePeriod, StatutPeriode
from app.models.reconduction import Reconduction
from app.models.requete import PrioriteRequete, Requete, TypeRequete
from app.models.sim import SIM, SIMMovement, StatutSim, TypeMouvementSim
from app.models.user import User

random.seed(42)  # jeu déterministe : deux exécutions produisent les mêmes montants

QUARTIERS_DLA = [
    "Akwa", "Bonanjo", "Deido", "Newbell", "Bépanda", "Bonabéri",
    "Logbaba", "Bonamoussadi", "Makepe", "Ndogbong", "Akwa Nord", "Oyom Abang",
]
QUARTIERS_YDE = [
    "Biyem-Assi", "Odza", "Mvan", "Nsam", "Emana", "Melen",
    "Cité Verte", "Etoudi", "Mokolo", "Bastos",
]
OPERATEURS = ["CAMTEL", "ORANGE", "MTN"]
TECHNOS = ["3G", "4G", "5G"]


def get_or_create_dsm(db, matricule, full_name, zone, partner_id):
    obj = db.query(DSM).filter(DSM.matricule == matricule).first()
    if obj:
        return obj, False
    obj = DSM(matricule=matricule, full_name=full_name, zone=zone, partner_id=partner_id)
    db.add(obj)
    db.flush()
    return obj, True


def get_or_create_pos(db, partner_id, code_pos, **fields):
    obj = db.query(POS).filter(POS.partner_id == partner_id, POS.code_pos == code_pos).first()
    if obj:
        return obj, False
    obj = POS(partner_id=partner_id, code_pos=code_pos, **fields)
    db.add(obj)
    db.flush()
    return obj, True


def get_or_create_bts(db, partner_id, code_bts, **fields):
    obj = db.query(BTS).filter(BTS.partner_id == partner_id, BTS.code_bts == code_bts).first()
    if obj:
        return obj, False
    obj = BTS(partner_id=partner_id, code_bts=code_bts, **fields)
    db.add(obj)
    db.flush()
    return obj, True
def main():
    db = SessionLocal()
    stats = {"dsm": 0, "pos": 0, "reconductions": 0, "bts": 0, "releves": 0,
             "sims": 0, "movements": 0, "periodes": 0, "primes": 0,
             "commissions": 0, "requetes": 0}
    try:
        partners = {p.id: p for p in db.query(Partner).all()}
        users = {u.username: u for u in db.query(User).all()}
        admin = users["admin"]
        chef = users["chef"]

        # ------------------------------------------------------------------
        # 1. DSM supplémentaires
        # ------------------------------------------------------------------
        dsms_plan = [
            ("DSM-DLA-02", "Amina Bello", "Douala Bonabéri", 1),
            ("DSM-YDE-01", "Paul Essomba", "Yaoundé Centre", 1),
            ("DSM-MC-02", "Clarisse Ngo", "Douala Ndokotti", 2),
            ("DSM-MC-03", "Yannick Talla", "Bafoussam", 2),
            ("DSM-GL-01", "Serge Ebogo", "Kribi", 3),
            ("DSM-ODI-01", "Ibrahim Sali", "Garoua", 4),
            ("DSM-SEV-01", "Nadège Mbarga", "Bertoua", 5),
        ]
        dsms_by_partner = {}
        for d in db.query(DSM).all():
            dsms_by_partner.setdefault(d.partner_id, []).append(d)
        for matricule, name, zone, pid in dsms_plan:
            dsm, created = get_or_create_dsm(db, matricule, name, zone, pid)
            if created:
                stats["dsm"] += 1
            dsms_by_partner.setdefault(pid, []).append(dsm)

        # ------------------------------------------------------------------
        # 2. POS répartis sur les DSM de chaque partenaire
        # ------------------------------------------------------------------
        plans = {
            1: (QUARTIERS_DLA + QUARTIERS_YDE, "R1",
                (4.03, 4.12, 9.68, 9.82), (3.82, 3.93, 11.42, 11.52)),
            2: (QUARTIERS_DLA[:8], "MC", (4.04, 4.10, 9.70, 9.79), None),
            3: ([f"Quartier {i}" for i in range(1, 7)], "GL", (2.90, 3.00, 9.30, 9.45), None),
            4: (["Poumpoumr", "Plateau Dokadjé", "Rumde Adjia", "Djarengol", "Yelwa", "Mazal"],
                "ODI", (9.20, 9.45, 13.28, 13.52), None),
            5: (["Nkolbikon", "Madagascar", "Dakar", "Goura", "Bitam", "Kpoumassi"],
                "SEV", (4.50, 4.70, 13.55, 13.80), None),
        }
        today = date.today()
        counter = 0
        for pid, (labels, prefix, dla_box, yde_box) in plans.items():
            partner_dsms = dsms_by_partner.get(pid) or []
            if not partner_dsms:
                continue
            for i, label in enumerate(labels):
                counter += 1
                code_pos = f"POS-{prefix}-{counter:04d}"
                dsm = partner_dsms[i % len(partner_dsms)]
                zone_dsm = (dsm.zone or "")
                box = yde_box if ("Yaoundé" in zone_dsm or "YDE" in zone_dsm) and yde_box else dla_box
                lat = round(random.uniform(*box[:2]), 5)
                lng = round(random.uniform(*box[2:]), 5)
                type_pos = TypePos.NOUVEAU if i % 5 < 3 else TypePos.RECONDUIT
                statut = StatutPos.ACTIF if i % 7 else (
                    StatutPos.SUSPENDU if i % 14 else StatutPos.FERME)
                dc = today - timedelta(days=random.randint(20, 420))
                de = dc + timedelta(days=365)
                pos, created = get_or_create_pos(
                    db, pid, code_pos,
                    name=f"{random.choice(['Kiosque', 'Boutique', 'Agence', 'Point', 'Espace'])} {label}",
                    address=f"{label} — rue {random.randint(1, 99)}",
                    zone=label,
                    latitude=lat, longitude=lng,
                    dsm_id=dsm.id,
                    type_pos=type_pos, status=statut,
                    stock_initial=random.randint(40, 120),
                    stock_actuel=random.randint(5, 80),
                    date_creation=dc, date_expiration=de,
                )
                if not created:
                    continue
                stats["pos"] += 1

                if type_pos == TypePos.RECONDUIT:
                    db.add(Reconduction(
                        pos_id=pos.id,
                        old_expiration=dc + timedelta(days=180),
                        new_expiration=de,
                        motif="Renouvellement contractuel annuel",
                        author_id=admin.id,
                    ))
                    pos.date_derniere_reconduction = today - timedelta(days=random.randint(1, 60))
                    stats["reconductions"] += 1

        # ------------------------------------------------------------------
        # 3. Périodes de primes puis primes + commissions DSM
        # ------------------------------------------------------------------
        periods_plan = [
            (1, "2026-S1", "Semestre 1 2026", date(2026, 1, 1), date(2026, 6, 30), StatutPeriode.CLOSED),
            (1, "2026-S2", "Semestre 2 2026", date(2026, 7, 1), date(2026, 12, 31), StatutPeriode.OPEN),
            (2, "2026-T3", "Trimestre 3 2026", date(2026, 7, 1), date(2026, 9, 30), StatutPeriode.OPEN),
            (3, "2026-S2", "Semestre 2 2026", date(2026, 7, 1), date(2026, 12, 31), StatutPeriode.DRAFT),
            (4, "2026-S2", "Semestre 2 2026", date(2026, 7, 1), date(2026, 12, 31), StatutPeriode.OPEN),
            (5, "2026-T3", "Trimestre 3 2026", date(2026, 7, 1), date(2026, 9, 30), StatutPeriode.OPEN),
        ]
        periods = {}
        for pid, code, label, start, end, status in periods_plan:
            period = db.query(PrimePeriod).filter(
                PrimePeriod.partner_id == pid, PrimePeriod.code == code).first()
            if not period:
                period = PrimePeriod(partner_id=pid, code=code, label=label,
                                     start_date=start, end_date=end, status=status)
                db.add(period)
                db.flush()
                stats["periodes"] += 1
            periods[(pid, code)] = period

        for pos in db.query(POS).filter(POS.type_pos == TypePos.NOUVEAU).all():
            if db.query(Prime).filter(Prime.pos_id == pos.id).first():
                continue
            period = periods.get((pos.partner_id, "2026-S2")) or periods.get((pos.partner_id, "2026-T3"))
            if not period:
                continue
            montant = random.choice([15000, 25000, 35000, 45000, 60000])
            roll = random.random()
            if roll < 0.35:
                status, validated_by = StatutPrime.PAYEE, admin.id
            elif roll < 0.65:
                status, validated_by = StatutPrime.VALIDEE, admin.id
            elif roll < 0.9:
                status, validated_by = StatutPrime.EN_ATTENTE, None
            else:
                status, validated_by = StatutPrime.BROUILLON, None
            db.add(Prime(
                pos_id=pos.id, prime_period_id=period.id,
                montant=montant, status=status,
                commentaire="Prime de création POS (seed riche)",
                demandeur_id=chef.id, validated_by=validated_by,
            ))
            stats["primes"] += 1

        for (pid, code), period in periods.items():
            for dsm in dsms_by_partner.get(pid, []):
                eligible = db.query(POS).filter(
                    POS.dsm_id == dsm.id, POS.type_pos == TypePos.NOUVEAU).count()
                db.add(DSMCommission(
                    partner_id=pid, dsm_id=dsm.id, prime_period_id=period.id,
                    eligible_pos_count=eligible,
                    amount=round(eligible * 2500 * random.uniform(0.9, 1.15), 2),
                    status=StatutCommission.VALIDATED if eligible else StatutCommission.DRAFT,
                    calculated_at=datetime.now(),
                    validated_by=admin.id if eligible else None,
                ))
                stats["commissions"] += 1

        # ------------------------------------------------------------------
        # 4. BTS + relevés sur 14 jours
        # ------------------------------------------------------------------
        dla_base = [(4.055 + 0.012 * k, 9.72 + 0.017 * k) for k in range(6)]
        yde_base = [(3.85 + 0.011 * k, 11.46 + 0.013 * k) for k in range(3)]
        bts_plan = []
        # Partenaires reels uniquement : les BTS ne sont plus rattachees au
        # partenaire de demonstration supprime.
        for k, (lat, lng) in enumerate(yde_base, start=1):
            bts_plan.append((4, f"BTS-ODI-{k:02d}", 9.25 + 0.014 * k, 13.33 + 0.015 * k, f"Garoua zone {k}"))
        for k, (lat, lng) in enumerate(dla_base[:4], start=1):
            bts_plan.append((5, f"BTS-SEV-{k:02d}", 4.53 + 0.012 * k, 13.60 + 0.014 * k, f"Bertoua zone {k}"))
        for k in range(1, 4):
            bts_plan.append((2, f"BTS-MC-{k:02d}", 4.05 + 0.01 * k, 9.73 + 0.012 * k, f"Douala MC {k}"))
        for k, (lat, lng) in enumerate([(2.92, 9.32), (2.95, 9.40)], start=1):
            bts_plan.append((3, f"BTS-GL-{k:02d}", lat, lng, f"Kribi zone {k}"))

        new_bts = []
        for pid, code, lat, lng, zone in bts_plan:
            bts, created = get_or_create_bts(
                db, pid, code,
                operateur=random.choice(OPERATEURS),
                technologie=random.choice(TECHNOS),
                capacite_max=float(random.choice([500, 1000, 1500, 2000])),
                latitude=lat, longitude=lng, zone=zone,
            )
            if created:
                stats["bts"] += 1
                new_bts.append(bts)

        now = datetime.now()
        for bts in new_bts:
            base_charge = random.uniform(45, 75)
            for day in range(13, -1, -1):
                charge = min(97.0, max(25.0, base_charge + random.uniform(-12, 18)))
                saturation = min(100.0, charge + random.uniform(-5, 8))
                db.add(BTSReleve(
                    bts_id=bts.id,
                    date_releve=now - timedelta(days=day, hours=random.randint(0, 5)),
                    charge=round(charge, 1),
                    debit=round(random.uniform(20, 80), 1),
                    connexions=random.randint(50, 400),
                    latence=round(random.uniform(10, 55), 1),
                    statut="maintenance" if charge > 90 else "actif",
                    taux_saturation=round(saturation, 1),
                    rendement=round(max(40.0, 100 - saturation * 0.6), 1),
                ))
                stats["releves"] += 1

        # ------------------------------------------------------------------
        # 5. Stock SIM + mouvement de réception
        # ------------------------------------------------------------------
        active_pos = db.query(POS).filter(POS.status == StatutPos.ACTIF).all()
        iccid_seq = db.query(SIM).count() + 1
        for _ in range(40):
            if not active_pos:
                break
            pos = random.choice(active_pos)
            iccid = f"8923701000000{iccid_seq:05d}"
            iccid_seq += 1
            if db.query(SIM).filter(SIM.iccid == iccid).first():
                continue
            roll = random.random()
            status = (StatutSim.EN_STOCK if roll < 0.4
                      else StatutSim.ACTIVE if roll < 0.65
                      else StatutSim.ASSIGNEE if roll < 0.85
                      else StatutSim.RETOURNEE if roll < 0.95
                      else StatutSim.PERDUE)
            sim = SIM(partner_id=pos.partner_id, pos_id=pos.id, iccid=iccid, status=status)
            db.add(sim)
            db.flush()
            db.add(SIMMovement(
                sim_id=sim.id, partner_id=pos.partner_id,
                movement_type=TypeMouvementSim.RECEPTION,
                author_id=admin.id, comment="Réception initiale (seed riche)",
            ))
            stats["sims"] += 1
            stats["movements"] += 1

        # ------------------------------------------------------------------
        # 6. Requêtes métier variées
        # ------------------------------------------------------------------
        requetes_plan = [
            ("EXT-RICH-101", 1, TypeRequete.AJOUT, "Demande de 25 SIM Akwa Nord",
             PrioriteRequete.HAUTE, "AC Akwa"),
            ("EXT-RICH-102", 1, TypeRequete.RECONDUCTION, "Renouvellement lot Deido",
             PrioriteRequete.NORMALE, "AC Deido"),
            ("EXT-RICH-103", 1, TypeRequete.DELINKAGE, "Détachement POS résilié Bonabéri",
             PrioriteRequete.URGENTE, "AC Bonabéri"),
            ("EXT-RICH-104", 1, TypeRequete.BASCULEMENT, "Transfert POS vers DSM Yaoundé",
             PrioriteRequete.NORMALE, "AC Yaoundé"),
            ("EXT-RICH-105", 1, TypeRequete.AUTRE, "Signalement matériel défectueux Makepe",
             PrioriteRequete.BASSE, "AC Makepe"),
            ("EXT-RICH-106", 2, TypeRequete.AJOUT, "Ouverture 12 POS Newbell",
             PrioriteRequete.HAUTE, "AC Newbell"),
            ("EXT-RICH-107", 2, TypeRequete.RECONDUCTION, "Prolongation contrats Ndokotti",
             PrioriteRequete.NORMALE, "AC Ndokotti"),
            ("EXT-RICH-108", 2, TypeRequete.AUTRE, "Litige stock SIM Bafoussam",
             PrioriteRequete.HAUTE, "AC Bafoussam"),
            ("EXT-RICH-109", 3, TypeRequete.AJOUT, "Lancement Kribi — 8 POS",
             PrioriteRequete.NORMALE, "AC Kribi"),
            ("EXT-RICH-110", 3, TypeRequete.DELINKAGE, "Retrait point de vente non conforme",
             PrioriteRequete.URGENTE, "AC Kribi"),
        ]
        for ext, pid, rtype, titre, prio, entite in requetes_plan:
            if db.query(Requete).filter(Requete.external_id == ext).first():
                continue
            done = random.randint(0, 18)
            demanded = done + random.randint(2, 12)
            finished = random.random() < 0.4
            db.add(Requete(
                external_id=ext, partner_id=pid,
                entite_en_charge=entite,
                type_requete=rtype, titre=titre,
                description=f"Demande générée par le seed riche ({entite}).",
                priorite=prio,
                date_creation=now - timedelta(days=random.randint(3, 45)),
                nombre_demande=demanded, nombre_effectue=done,
                nombre_rejete=random.randint(0, 2),
                delai=random.randint(5, 21),
                date_finalisation=now - timedelta(days=1) if finished else None,
                demandeur_id=chef.id,
                closed_at=now - timedelta(hours=12) if finished else None,
            ))
            stats["requetes"] += 1

        db.commit()
        print("Seed riche terminé (additif, rien n'a été supprimé) :")
        for key, value in stats.items():
            print(f"  - {key}: +{value}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()

