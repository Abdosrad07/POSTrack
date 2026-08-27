"""
seed_demo_complet : peuple abondamment la base pour une demonstration
realiste de bout en bout (dashboards, modules POS/SIM/BTS/Primes/Requetes).

Particularites :
- Deterministe (random.seed fixe) => jeu reproducible ;
- Les 6 comptes existants sont recrees avec LEURS MEMES hashs bcrypt
  (identifiants inchanges : admin/admin123, ...) ;
- Dates generees RELATIVEMENT a la date du jour => toujours actuel ;
- Coherence garantie : stock_actuel == nb SIM EN_STOCK, primes liees aux
  periodes couvrant la creation du POS, reconductions coherentes avec
  date_expiration, commissions rattachees aux periodes de primes.

Usage : Set-Location backend ; venv\\Scripts\\python scripts\\seed_demo_complet.py
"""
from __future__ import annotations

import os
import random
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
os.chdir(BACKEND_DIR)
sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy.orm import Session  # noqa: E402

from app.core.database import Base, SessionLocal, engine  # noqa: E402
from app.security.password import hash_password  # noqa: E402
from app.models.user import User, UserPartner, UserPOS  # noqa: E402
from app.models.partner import Partner, MicroZone, PartnerSalesTarget  # noqa: E402
from app.models.dsm import DSM  # noqa: E402
from app.models.pos import POS, TypePos, StatutPos  # noqa: E402
from app.models.sim import SIM, StatutSim, TypeMouvementSim, SIMMovement  # noqa: E402
from app.models.bts import BTS  # noqa: E402
from app.models.bts_releve import BTSReleve  # noqa: E402

from app.models.prime_period import PrimePeriod, StatutPeriode  # noqa: E402
from app.models.prime import Prime, StatutPrime  # noqa: E402
from app.models.reconduction import Reconduction  # noqa: E402
from app.models.requete import (Requete, RequeteEntite, RequeteCommentaire,
                                TypeRequete, PrioriteRequete)  # noqa: E402
from app.models.pos_performance import POSPerformance  # noqa: E402
from app.models.dsm_commission import DSMCommission, StatutCommission  # noqa: E402
from app.models.audit import AuditLog  # noqa: E402
from app.models.revoked_token import RevokedToken  # noqa: E402
from app.models.import_batch import ImportBatch  # noqa: E402
from app.services.analytics_service import calculate_pos_performance  # noqa: E402

TODAY = date.today()
NOW = datetime.utcnow().replace(microsecond=0)
rng = random.Random(42)

# ---------------------------------------------------------------------------
# Helpers dates / noms camerounais realistes
# ---------------------------------------------------------------------------
PRENOMS_H = ["Jean", "Patrick", "Alain", "Serge", "Eric", "Blaise", "Franck",
             "Yannick", "Christian", "Steve", "Rodrigue", "Cedric", "Herve",
             "Brice", "Guy", "Landry"]
NOMS = ["Moukoko", "Etoundi", "Ngo Bassong", "Kamdem", "Tchoumi", "Ndoumbe",
        "Essomba", "Abena", "Fotso", "Mbarga", "Onana", "Ballack", "Simen",
        "Talla", "Ekani", "Menye"]


def person() -> str:
    return f"{rng.choice(PRENOMS_H)} {rng.choice(NOMS)}"


def rand_dt(base_day: date, hour_lo: int = 8, hour_hi: int = 18) -> datetime:
    return datetime(base_day.year, base_day.month, base_day.day,
                    rng.randint(hour_lo, hour_hi), rng.randint(0, 59))


def month_start(d: date | None = None, offset: int = 0) -> date:
    ref = d or TODAY
    m = ref.month + offset
    y = ref.year + (m - 1) // 12
    m = (m - 1) % 12 + 1
    return date(y, m, 1)


def month_end(d: date) -> date:
    return month_start(d, 1) - timedelta(days=1)


def months_window(n: int = 6) -> list[date]:
    """Les n derniers debuts de mois (mois courant inclus), ordre croissant."""
    return [month_start(offset=i) for i in range(-(n - 1), 1)]


# Hashs bcrypt reels des 6 comptes existants -> identifiants INCHANGES
EXISTING_HASHES = {
    "admin": "$2b$12$iaTZ06RNyG6TDf.6SIWtbu8fTd2KCMlHRpOh1uIiHfrGqhQkO9wMa",
    "manager": "$2b$12$pwvqQfd.LGGQqC.mtApM9eUZb5jpW9VG/3BzVriS3wnsFwmsoApeG",
    "manager.mc": "$2b$12$X3JMgJ9kh/d1zX.McVM.9Oc2DzTP/uGCqlkgf2/FbaXK7cIeHzJ8e",
    "chef": "$2b$12$m7Q1A9gmiOO6e.tQxln5ZuqQ7X9uzGEymxw8JP3oOWysB52NMgYOK",
    "dsm.mc": "$2b$12$XxzUgjBGJ6uSPp0SjzQGpesnkq5YT5dhp4N99tlCZRG3u5pRsLf.G",
    "oper.mc": "$2b$12$v1l9oOCtONoC/dm2DCU.Y.FCp2UX.SNBgUoua6/grjmEJdKTEWNDC",
}

# ===========================================================================
# 0. PURGE COMPLETE ET COHERENTE (les partenaires eux-memes sont conserves)
# ===========================================================================
Base.metadata.create_all(bind=engine)
db: Session = SessionLocal()

print("== Purge des donnees metier existantes ==")
for model in [
    RevokedToken, AuditLog,
    RequeteCommentaire, RequeteEntite, Requete,
    DSMCommission, Prime, PrimePeriod, Reconduction, POSPerformance,
    SIMMovement, SIM, BTSReleve, BTS,
    UserPOS, UserPartner, ImportBatch,
    POS, DSM, MicroZone, PartnerSalesTarget,
]:
    deleted = db.query(model).delete(synchronize_session=False)
    print(f"   {model.__tablename__:<24}: -{deleted}")
deleted_users = db.query(User).delete(synchronize_session=False)
print(f"   {'users':<24}: -{deleted_users}")
db.commit()

# ===========================================================================
# 1. PARTENAIRES : enrichissement carte d'identite
# ===========================================================================
print("\n== Enrichissement des Partenaires ==")
p_mc = db.query(Partner).filter(Partner.code == "PART-MC").one()
p_gl = db.query(Partner).filter(Partner.code == "PART-GL").one()
p_odi = db.query(Partner).filter(Partner.code == "PART-ODI").one()
p_sev = db.query(Partner).filter(Partner.code == "PART-SEV").one()

p_mc.address = "Boulevard de la Liberte, Akwa - Douala"
p_mc.responsable_name = "Patrick Moukoko"
p_mc.responsable_contact = "+237 677 45 12 30"
p_mc.commercial_name = "Sandra Ngo Bassong"
p_mc.commercial_contact = "+237 691 22 08 47"
p_mc.master_sim_number = "62241109873"

p_gl.address = "Rue Kondengui, Yaounde"
p_gl.responsable_name = "Jean-Marie Etoundi"
p_gl.responsable_contact = "+237 699 71 55 02"
p_gl.commercial_name = "Cedric Fotso"
p_gl.commercial_contact = "+237 655 34 91 18"
p_gl.master_sim_number = "62241123456"

for p in (p_odi, p_sev):  # pre-onboarding : contrats a partir du mois prochain
    p.responsable_name = person()
    p.responsable_contact = f"+237 6{rng.randint(50, 99)} {rng.randint(10, 99)} {rng.randint(10, 99)} {rng.randint(10, 99)}"
db.commit()
print("   Cartes d'identite remplies pour MC / GL ; Odi & Seven en pre-onboarding.")

# ===========================================================================
# 2. COMPTES UTILISATEURS (6 comptes d'origine + holders de POS)
# ===========================================================================
print("\n== Comptes utilisateurs ==")
USERS = [
    ("admin", "admin@postrack.cm", EXISTING_HASHES["admin"], "Administrateur PostTrack", "ADMIN", None),
    ("manager", "manager@postrack.cm", EXISTING_HASHES["manager"], "Direction Operations", "MANAGER", None),
    ("manager.mc", "manager.mc@postrack.cm", EXISTING_HASHES["manager.mc"], "Manager Master Color", "MANAGER", None),
    ("chef", "chef@postrack.cm", EXISTING_HASHES["chef"], "Chef operationnel Master Color", "CHEF_OPERATIONNEL", None),
    ("dsm.mc", "dsm.mc@postrack.cm", EXISTING_HASHES["dsm.mc"], "DSM Master Color", "CHEF_OPERATIONNEL", None),
    ("oper.mc", "oper.mc@postrack.cm", EXISTING_HASHES["oper.mc"], "Operationnel Master Color", "OPERATIONNEL", 2),
]
by_username: dict[str, User] = {}
for uname, umail, uhash, ufull, urole, upartner in USERS:
    u = User(username=uname, email=umail, hashed_password=uhash, full_name=ufull,
             role=urole, is_active=True, partner_id=upartner)
    db.add(u)
    by_username[uname] = u

# Complement GL pour la demonstration multi-partenaires
holder_pwd_hash = hash_password("pos2026")
by_username["chef.gl"] = User(
    username="chef.gl", email="chef.gl@postrack.cm",
    hashed_password=hash_password("chef123"),
    full_name="Chef operationnel Glothelo", role="CHEF_OPERATIONNEL", is_active=True,
)
db.add(by_username["chef.gl"])
db.flush()

for u, partner_ids in [
    ("admin", [2, 3, 4, 5]), ("manager", [2, 3, 4, 5]), ("manager.mc", [2]),
    ("chef", [2, 3]), ("dsm.mc", [2]), ("oper.mc", [2]), ("chef.gl", [3]),
]:
    for pid in partner_ids:
        db.add(UserPartner(user_id=by_username[u].id, partner_id=pid))
db.commit()
print("   7 comptes permanents crees (mots de passe inchanges pour les 6 d'origine).")

# ===========================================================================
# 3. DSM ET MICRO-ZONES
# ===========================================================================
print("\n== DSM et Micro-zones ==")
DSMS: dict[int, list[DSM]] = {2: [], 3: []}
mc_dsm_defs = [("DSM-MC-AKW", "Fabrice Kamdem", "Akwa / Deido"),
               ("DSM-MC-BNB", "Olivier Ndoumbe", "Bonaberi"),
               ("DSM-MC-NWB", "Serge Essomba", "New-Bell"),
               ("DSM-MC-NDB", "Herve Talla", "Ndogbong / Bonamoussadi")]
gl_dsm_defs = [("DSM-GL-YDE1", "Steve Onana", "Centre-Ville / Mvan"),
               ("DSM-GL-YDE2", "Blaise Abena", "Nsam / Obobogo")]
for pid, defs in ((2, mc_dsm_defs), (3, gl_dsm_defs)):
    for matricule, full_name, zone in defs:
        DSMS[pid].append(DSM(matricule=matricule, full_name=full_name,
                             zone=zone, partner_id=pid))
    db.add_all(DSMS[pid])
db.flush()

ZONE_DEFS = {
    2: [("Akwa", "MC-Z1", 4.0483, 9.6968), ("Deido", "MC-Z2", 4.0611, 9.7170),
        ("Bonaberi", "MC-Z3", 4.0733, 9.6940), ("New-Bell", "MC-Z4", 4.0421, 9.7086),
        ("Bonamoussadi", "MC-Z5", 4.0872, 9.7375), ("Ndogbong", "MC-Z6", 4.0642, 9.7618)],
    3: [("Centre-Ville", "GL-Z1", 3.8667, 11.5167), ("Mvan", "GL-Z2", 3.8136, 11.5489),
        ("Nsam", "GL-Z3", 3.9042, 11.5311)],
}
for pid, zones in ZONE_DEFS.items():
    for zname, zcode, lat, lon in zones:
        db.add(MicroZone(
            partner_id=pid, name=zname, code=zcode, latitude=lat, longitude=lon,
            boundaries={"type": "Polygon", "coordinates": [[
                [lon - 0.014, lat - 0.012], [lon + 0.014, lat - 0.012],
                [lon + 0.014, lat + 0.012], [lon - 0.014, lat + 0.012],
                [lon - 0.014, lat - 0.012]]]},
        ))
db.commit()
print(f"   MC : {len(mc_dsm_defs)} DSM + {len(ZONE_DEFS[2])} micro-zones | "
      f"GL : {len(gl_dsm_defs)} DSM + {len(ZONE_DEFS[3])} micro-zones")

# ===========================================================================
# 4. OBJECTIFS MENSUELS DE VENTE (6 derniers mois) : MC en croissance,
#    GL plus modeste. Le mois COURANT existe -> progression dashboard OK.
# ===========================================================================
print("\n== Objectifs mensuels de vente ==")
MONTHS = months_window(6)
for pid, base in ((2, dict(cre=38, red=20, sell=150, load=220, rev=2_100_000)),
                  (3, dict(cre=16, red=9, sell=70, load=110, rev=900_000))):
    for i, m in enumerate(MONTHS):
        db.add(PartnerSalesTarget(
            partner_id=pid, month=m,
            creation_target=base["cre"] + i * 3 + rng.randint(-2, 2),
            redeployment_target=base["red"] + i // 2 + rng.randint(-1, 1),
            sell_out_target=int(base["sell"] * (1 + 0.07 * i)),
            loading_target=int(base["load"] * (1 + 0.06 * i)),
            revenue_target=int(base["rev"] * (1 + 0.09 * i)),
            creation_stock_initial=60 if pid == 2 else 30,
            redeployment_stock_initial=25 if pid == 2 else 15,
        ))
db.commit()
print(f"   12 lignes d'objectifs sur {MONTHS[0]} -> {MONTHS[-1]}")

# ===========================================================================
# 5. POINTS DE VENTE (+ detenteurs lies)
# ===========================================================================
print("\n== Points de vente ==")
LIEUX = ["Marche", "Carrefour", "Rond-point", "Gare", "Station", "Boutique",
         "Pharmacie", "Ecole", "Eglise", "Quartier", "Immeuble", "Kiosque"]
QUALIFS = ["Central", "Nord", "Sud", "Est", "Ouest", "II", "III", "Principal", "Annexe"]

def pos_name(zone: str) -> str:
    return f"{rng.choice(LIEUX)} {zone} {rng.choice(QUALIFS)}"

holders_created: list[tuple[str, User]] = []
partner_pos: dict[int, list[POS]] = {2: [], 3: []}

PARTNER_POS_PLAN = {
    # partner_id, prefixe code, nb total, dsms, zones possibles
    2: ("POS-MC-", 27, DSMS[2], [z[0] for z in ZONE_DEFS[2]]),
    3: ("POS-GL-", 11, DSMS[3], [z[0] for z in ZONE_DEFS[3]]),
}

# Centre GPS (WGS84) de chaque micro-zone : chaque POS recoit une
# position biaisee autour du centre de sa zone (~+/-900 m) afin que la
# carte Leaflet et les tableaux affichent des coordonnees realistes.
ZONE_COORDS = {
    zname: (lat, lon)
    for zones in ZONE_DEFS.values()
    for (zname, _zcode, lat, lon) in zones
}

for pid, (prefix, total, dsms, zone_names) in PARTNER_POS_PLAN.items():
    first_num = 2 if pid == 2 else 1  # MC-000001 existe deja (id 201)
    for i in range(total):
        zone = zone_names[i % len(zone_names)]
        dsm = dsms[i % len(dsms)]
        age_days = rng.randint(200, 340) if i % 5 == 0 else rng.randint(10, 190)
        date_creation = TODAY - timedelta(days=age_days)
        type_pos = TypePos.RECONDUIT if i % 5 == 0 else TypePos.NOUVEAU

        status = StatutPos.ACTIF
        r = i % 13
        if r == 4:
            status = StatutPos.SUSPENDU
        elif r == 8 and type_pos == TypePos.NOUVEAU:
            status = StatutPos.FERME

        # Echeance contractuelle : ~creation + 1 an ; 4 actifs tombent dans
        # la fenetre d'alerte (<30 j), 2 deja expires encore ACTIF.
        date_expiration = date_creation + timedelta(days=rng.randint(330, 400))
        if i < 4 and status == StatutPos.ACTIF:
            date_expiration = TODAY + timedelta(days=rng.randint(3, 27))
        elif i in (4, 5) and status == StatutPos.ACTIF:
            date_expiration = TODAY - timedelta(days=rng.randint(2, 18))

        stock_initial = rng.randint(18, 45) if status != StatutPos.FERME else 15
        stock_actuel = {"ACTIF": rng.randint(6, max(9, stock_initial // 2)),
                        "SUSPENDU": rng.randint(3, 9),
                        "FERME": rng.randint(0, 2)}[status.value]

        holder_id = None
        if status == StatutPos.ACTIF and i % 4 != 3:
            uname = f"pos.{prefix.split('-')[1].lower()}{first_num + i:02d}"
            full_name = person()
            hu = by_username.get(uname) or User(
                username=uname, email=f"{uname}@postrack.cm",
                hashed_password=holder_pwd_hash, full_name=full_name,
                role="OPERATIONNEL", is_active=True, partner_id=pid,
            )
            db.add(hu)
            db.flush()
            by_username[uname] = hu
            holder_id = hu.id
            holders_created.append((uname, hu))

        base_lat, base_lon = ZONE_COORDS.get(zone, (0.0, 0.0))
        p = POS(code_pos=f"{prefix}{first_num + i:06d}", name=pos_name(zone),
                address=f"{zone}, {rng.choice(LIEUX).lower()} proche {rng.choice(LIEUX).lower()}",
                zone=zone,
                latitude=round(base_lat + rng.uniform(-0.008, 0.008), 6),
                longitude=round(base_lon + rng.uniform(-0.008, 0.008), 6),
                partner_id=pid, dsm_id=dsm.id,
                holder_user_id=holder_id,
                type_pos=type_pos, status=status,
                stock_initial=stock_initial, stock_actuel=stock_actuel,
                donnees_additionnelles={"canal": rng.choice(["boutique", "kiosque", "table"]),
                                        "surface_m2": rng.randint(6, 40)},
                date_creation=date_creation, date_expiration=date_expiration)
        db.add(p)
db.flush()
# Liens detenteur <-> POS + rattachement partenaire (POS deja persistes)
pos_all = db.query(POS).order_by(POS.id).all()
for _p in pos_all:
    if _p.holder_user_id:
        db.add(UserPOS(user_id=_p.holder_user_id, pos_id=_p.id))
for _uname, _hu in holders_created:
    db.add(UserPartner(user_id=_hu.id, partner_id=_hu.partner_id))
db.commit()




mc_pos = [p for p in pos_all if p.partner_id == 2]
gl_pos = [p for p in pos_all if p.partner_id == 3]
expiring_mc = sum(1 for p in mc_pos if TODAY <= p.date_expiration <= TODAY + timedelta(days=30))
print(f"   MC : {len(mc_pos)} POS | GL : {len(gl_pos)} POS | "
      f"detenteurs lies : {sum(1 for p in pos_all if p.holder_user_id)} | "
      f"alertes expiration MC sous 30 j : {expiring_mc}")

# ===========================================================================
# 6. SIMS + HISTORIQUE DE MOUVEMENTS (reception -> vente -> activation...)
#    Invariant respecte : nb EN_STOCK sur un POS == pos.stock_actuel.
# ===========================================================================
print("\n== SIMs et mouvements de stock ==")
iccid_counter = {"n": 1}
msisdn_used: set[str] = set()


def new_iccid() -> str:
    iccid_counter["n"] += 1
    return f"8933702000{iccid_counter['n']:08d}"  # 20 chiffres

def new_msisdn() -> str:
    while True:
        num = f"{rng.choice(['65', '67', '68', '69'])}{rng.randint(10 ** 7, 10 ** 8 - 1)}"
        if num not in msisdn_used:
            msisdn_used.add(num)
            return num[:9]

AUTHOR_STAFF = [u.id for u in (by_username["chef"], by_username["oper.mc"],
                               by_username["chef.gl"], by_username["manager.mc"])]

move_counter = {"n": 0}
for pid, pos_list in ((2, mc_pos), (3, gl_pos)):
    staff = [by_username["chef"].id, by_username["oper.mc"].id] if pid == 2 \
        else [by_username["chef.gl"].id]
    lot_no = 0
    for p in pos_list:
        # --- SIM EN_STOCK (approvisionnement) ---
        n_stock = p.stock_actuel
        reception_day = max(p.date_creation,
                            TODAY - timedelta(days=rng.randint(20, 70)))
        lot_no += 1
        rec_comment = f"Reception lot MTN-{p.code_pos.split('-')[-1]}-{lot_no % 9}"

        def add_movement(sim: SIM, mtype: TypeMouvementSim, at: datetime,
                         comment: str, _pid=pid, _staff=tuple(staff)):
            move_counter["n"] += 1
            db.add(SIMMovement(sim_id=sim.id, partner_id=_pid, movement_type=mtype,
                               author_id=rng.choice(_staff) if rng.random() < .8
                               else rng.choice(AUTHOR_STAFF),
                               comment=comment, created_at=at))

        for _ in range(n_stock):
            s = SIM(partner_id=pid, pos_id=p.id, iccid=new_iccid(),
                    numero_msisdn=None, status=StatutSim.EN_STOCK)
            db.add(s)
            db.flush()
            add_movement(s, TypeMouvementSim.RECEPTION, rand_dt(reception_day), rec_comment)

        # --- SIM ACTIVE chez les clients (spread sur les 6 derniers mois) ---
        horizon_days = (TODAY - p.date_creation).days or 1
        for _ in range(rng.randint(3, min(14, max(4, p.stock_initial // 3)))):
            act_day = TODAY - timedelta(days=rng.randint(2, min(horizon_days - 1, 180)))
            act_at = rand_dt(act_day, 8, 19)
            if act_at > NOW:
                act_at = NOW
            msisdn = new_msisdn()
            s = SIM(partner_id=pid, pos_id=p.id, iccid=new_iccid(),
                    numero_msisdn=msisdn, status=StatutSim.ACTIVE)
            db.add(s)
            db.flush()
            sell_at = act_at - timedelta(hours=rng.randint(12, 72))
            add_movement(s, TypeMouvementSim.VENTE, sell_at,
                         f"Vente client ligne {msisdn}")
            add_movement(s, TypeMouvementSim.ACTIVATION, act_at,
                         f"Activation reseau ({rng.choice(['MTN CM', 'Orange CM'])})")

        # --- SIM ASSIGNEE (vendues, activation en attente) ---
        for _ in range(rng.randint(0, 4)):
            vendu_jour = TODAY - timedelta(days=rng.randint(0, 25))
            at = rand_dt(vendu_jour)
            if at > NOW:
                at = NOW
            s = SIM(partner_id=pid, pos_id=p.id, iccid=new_iccid(),
                    numero_msisdn=new_msisdn(), status=StatutSim.ASSIGNEE)
            db.add(s)
            db.flush()
            add_movement(s, TypeMouvementSim.VENTE, at, "Vente au client - activation en attente")

        # --- Cas limites --- 
        if p.status != StatutPos.FERME and rng.random() < 0.22:
            at = rand_dt(TODAY - timedelta(days=rng.randint(5, 40)))
            s = SIM(partner_id=pid, pos_id=p.id, iccid=new_iccid(),
                    numero_msisdn=new_msisdn(), status=StatutSim.RETOURNEE)
            db.add(s); db.flush()
            add_movement(s, TypeMouvementSim.RECEPTION, at - timedelta(days=30), "Reception initiale")
            add_movement(s, TypeMouvementSim.RETOUR, at, "Retour apres resiliation client")
        if rng.random() < 0.14:
            at = rand_dt(TODAY - timedelta(days=rng.randint(15, 60)))
            s = SIM(partner_id=pid, pos_id=p.id, iccid=new_iccid(),
                    numero_msisdn=None, status=StatutSim.PERDUE)
            db.add(s); db.flush()
            add_movement(s, TypeMouvementSim.RECEPTION, at - timedelta(days=20), "Reception initiale")
            add_movement(s, TypeMouvementSim.PERTE, at, "Carte declaree perdue/volee par le detenteur")
db.commit()

from sqlalchemy import func as _f
sim_counts = dict(db.query(SIM.status, _f.count(SIM.id)).group_by(SIM.status).all())
move_n = db.query(_f.count(SIMMovement.id)).scalar()
print(f"   {sum(sim_counts.values())} SIM au total | {move_n} mouvements "
      f"| repartition : { {k.value: v for k, v in sim_counts.items()} }")


# ===========================================================================
# 7. BTS + RELEVES (45 jours x 2/jour). BTS-MC-03 est un point chaud dont le
#    DERNIER releve depasse le seuil 80% -> carte "BTS saturees" alimentee.
# ===========================================================================
print("\n== BTS et releves de charge ==")
BTS_DEFS = [
    (2, "BTS-MC-01", "MTN-CM", "4G", 4000.0, 4.0512, 9.7001, "Akwa", 62),
    (2, "BTS-MC-02", "CAMTEL", "3G", 2500.0, 4.0760, 9.6975, "Bonaberi", 57),
    (2, "BTS-MC-03", "MTN-CM", "4G", 3500.0, 4.0438, 9.7090, "New-Bell", 81),   # hotspot
    (2, "BTS-MC-04", "Orange-CM", "4G", 3000.0, 4.0665, 9.7640, "Ndogbong", 66),
    (3, "BTS-GL-01", "MTN-CM", "4G", 2800.0, 3.8672, 11.5180, "Centre-Ville", 60),
    (3, "BTS-GL-02", "CAMTEL", "3G", 2200.0, 3.9011, 11.5287, "Nsam", 52),
]
RELEVE_DAYS = 45
n_releves = 0
bts_by_partner: dict[int, list[BTS]] = {2: [], 3: []}
for pid, code_bts, op, techno, cap, lat, lon, zone, base_sat in BTS_DEFS:
    b = BTS(partner_id=pid, code_bts=code_bts, operateur=op, technologie=techno,
            capacite_max=cap, latitude=lat, longitude=lon, zone=zone)
    db.add(b)
    db.flush()
    bts_by_partner[pid].append(b)
    debit_base = rng.uniform(14, 30) if techno == "4G" else rng.uniform(2.5, 6.5)
    for day_off in range(RELEVE_DAYS):
        d = TODAY - timedelta(days=day_off)
        weekend_factor = 0.82 if d.weekday() >= 5 else 1.0
        growth = 1.0 - 0.003 * day_off  # charge qui augmente vers aujourd'hui
        for hour in (8, 15):
            jitter = rng.uniform(-11, 11)
            sat = max(12.0, min(99.0, (base_sat + jitter) * weekend_factor * growth))
            if sat > 97:
                sat = 97.0
            statut = "maintenance" if rng.random() < 0.02 else "actif"
            db.add(BTSReleve(
                bts_id=b.id,
                date_releve=datetime(d.year, d.month, d.day, hour, rng.randint(0, 59)),
                charge=round(sat / 100.0 * rng.uniform(0.85, 1.08) * 100, 1),
                taux_saturation=round(sat, 1),
                rendement=round(min(98.0, max(35.0, 118 - sat + rng.uniform(-6, 6))), 1),
                debit=round(debit_base * (sat / 80.0) * rng.uniform(0.8, 1.15), 2),
                connexions=int(cap * sat / 100.0 * rng.uniform(0.25, 0.55)),
                latence=round(rng.uniform(18, 42) + max(0.0, sat - 75) * 1.8, 1),
                statut=statut,
                commentaire=None if statut == "actif" else "Intervention technicien planifiee",
            ))
            n_releves += 1
db.commit()
# Garantie demo : le DERNIER releve de New-Bell reste > seuil (80%) meme
# si la date courante tombe un week-end ou avec un fort jitter negatif.
b_hot = bts_by_partner[2][2]
db.add(BTSReleve(bts_id=b_hot.id,
                 date_releve=datetime(TODAY.year, TODAY.month, TODAY.day, 17, 45),
                 charge=91.5, taux_saturation=89.7, rendement=41.0, debit=21.3,
                 connexions=1720, latence=64.8, statut="actif",
                 commentaire="Forte affluence marchee de New-Bell"))
n_releves += 1
db.commit()
mc_sat = [r.taux_saturation for r in db.query(BTSReleve)
          .filter(BTSReleve.bts_id == bts_by_partner[2][2].id)
          .order_by(BTSReleve.date_releve.desc()).limit(2)]
print(f"   {len(BTS_DEFS)} BTS | {n_releves} releves sur {RELEVE_DAYS} jours "
      f"| dernier releve New-Bell : {mc_sat}")

# ===========================================================================
# 8. PERIODES DE PRIMES + PRIMES DE CREATION + COMMISSIONS DSM
# ===========================================================================
print("\n== Periodes de primes, primes et commissions DSM ==")
periods_by_month: dict[tuple[int, date], PrimePeriod] = {}
SHORT = {2: "MC", 3: "GL"}
MONTHS_LABEL = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet",
                "aout", "septembre", "octobre", "novembre", "decembre"]
current_idx = len(MONTHS) - 1
for pid in (2, 3):
    for idx, m in enumerate(MONTHS):
        end = month_end(m)
        if idx < current_idx:
            st = StatutPeriode.CLOSED
        elif idx == current_idx:
            st = StatutPeriode.OPEN
        else:
            st = StatutPeriode.DRAFT
        pp = PrimePeriod(partner_id=pid, code=f"{SHORT[pid]}-{m.strftime('%Y-%m')}",
                         label=f"Primes {['', ''][0]}{SHORT[pid]} - "
                               f"{MONTHS_LABEL[m.month - 1].capitalize()} {m.year}",
                         start_date=m, end_date=end, status=st)
        db.add(pp)
        periods_by_month[(pid, m)] = pp
# periode du mois suivant en DRAFT pour le workflow admin
nxt = month_start(offset=1)
for pid in (2, 3):
    db.add(PrimePeriod(partner_id=pid, code=f"{SHORT[pid]}-{nxt.strftime('%Y-%m')}",
                       label=f"Primes {SHORT[pid]} - "
                             f"{MONTHS_LABEL[nxt.month - 1].capitalize()} {nxt.year}",
                       start_date=nxt, end_date=month_end(nxt), status=StatutPeriode.DRAFT))
db.flush()

dsm_primes = {}   # (period_id, dsm_id) -> montant cumule valide
admin_id, chef_id, chef_gl_id = by_username["admin"].id, by_username["chef"].id, by_username["chef.gl"].id
n_primes = n_commissions = 0
for pid, pos_list in ((2, mc_pos), (3, gl_pos)):
    demander = chef_id if pid == 2 else chef_gl_id
    for p in pos_list:
        if p.type_pos != TypePos.NOUVEAU:
            continue                                   # prime de creation : POS Nouveau uniquement
        diff_months = (TODAY.year - p.date_creation.year) * 12 \
            + (TODAY.month - p.date_creation.month)
        pm = MONTHS[min(max(diff_months, 0), current_idx)]
        pp = periods_by_month[(pid, pm)]
        # statut selon anciennete de la periode
        if pp.status == StatutPeriode.DRAFT:
            st = StatutPrime.BROUILLON
        elif pm == MONTHS[current_idx]:
            st = rng.choices([StatutPrime.EN_ATTENTE, StatutPrime.VALIDEE,
                              StatutPrime.BROUILLON], [55, 30, 15])[0]
        elif pm == MONTHS[current_idx - 1]:
            st = rng.choices([StatutPrime.VALIDEE, StatutPrime.PAYEE], [60, 40])[0]
        else:
            st = StatutPrime.PAYEE
        validated_at = None
        if st in (StatutPrime.VALIDEE, StatutPrime.PAYEE):
            cand = datetime.combine(pp.end_date + timedelta(days=rng.randint(1, 8)),
                                    datetime.min.time()) + timedelta(hours=rng.randint(9, 17))
            validated_at = min(cand, NOW)
        montant = float(rng.choice([35000, 45000, 50000, 60000, 75000, 90000]))
        db.add(Prime(pos_id=p.id, prime_period_id=pp.id, montant=montant, status=st,
                     commentaire="Prime de creation POS",
                     demandeur_id=demander,
                     validated_by=admin_id if validated_at else None,
                     validated_at=validated_at))
        n_primes += 1
        if st in (StatutPrime.VALIDEE, StatutPrime.PAYEE):
            key = (pp.id, p.dsm_id)
            dsm_primes[key] = dsm_primes.get(key, 0.0) + montant
db.commit()
print(f"   {len(MONTHS) * 2 + 2} periodes | {n_primes} primes de creation")

# --- Commissions DSM : deroulent des primes validees par periode/DSM ---
for pid in (2, 3):
    for m_idx in range(current_idx - 2, current_idx + 1):
        pp = periods_by_month[(pid, MONTHS[m_idx])]
        for dsm in DSMS[pid]:
            amount = round(dsm_primes.get((pp.id, dsm.id), 0.0) * 0.03 + rng.uniform(4000, 9000), 2)
            eligible = sum(1 for p_ in (mc_pos if pid == 2 else gl_pos) if p_.dsm_id == dsm.id)
            if m_idx == current_idx - 2:
                st_c, val = StatutCommission.PAID, admin_id
            elif m_idx == current_idx - 1:
                st_c, val = StatutCommission.VALIDATED, admin_id
            else:
                st_c, val = rng.choice([StatutCommission.CALCULATED, StatutCommission.DRAFT]), None
            db.add(DSMCommission(partner_id=pid, dsm_id=dsm.id, prime_period_id=pp.id,
                                 eligible_pos_count=eligible, amount=amount, status=st_c,
                                 calculated_at=min(NOW - timedelta(days=rng.randint(0, 20)), NOW),
                                 validated_by=val))
            n_commissions += 1
db.commit()
print(f"   {n_commissions} commissions DSM calculees")

# ===========================================================================
# 9. RECONDUCTIONS coherentes avec le cycle contractuel des POS RECONDUIT
# ===========================================================================
print("\n== Reconductions ==")
MOTIFS = ["Renouvellement contractuel annuel", "Performance satisfaisante du detenteur",
          "Engagement volume activations tenu", "Bon historique de paiement"]
n_recond = 0
for pid, pos_list in ((2, mc_pos), (3, gl_pos)):
    author_pool = [admin_id, chef_id] if pid == 2 else [admin_id, chef_gl_id]
    for p in pos_list:
        if p.type_pos != TypePos.RECONDUIT:
            continue
        old_exp = p.date_creation + timedelta(days=rng.randint(170, 200))
        old_exp = min(old_exp, TODAY)
        new_exp = p.date_expiration
        rec_date = old_exp - timedelta(days=rng.randint(0, 6))
        db.add(Reconduction(pos_id=p.id, old_expiration=old_exp, new_expiration=new_exp,
                            motif=rng.choice(MOTIFS),
                            author_id=rng.choice(author_pool),
                            created_at=rand_dt(rec_date)))
        p.date_derniere_reconduction = rec_date
        n_recond += 1
        # certains POS ont une reconduction anterieure supplementaire
        if rng.random() < 0.25:
            older_old = p.date_creation + timedelta(days=rng.randint(-10, 15))
            db.add(Reconduction(pos_id=p.id, old_expiration=older_old,
                                new_expiration=old_exp,
                                motif="Renouvellement initial",
                                author_id=rng.choice(author_pool),
                                created_at=rand_dt(older_old - timedelta(days=3))))
            n_recond += 1
db.commit()
print(f"   {n_recond} reconductions enregistrees")

# ===========================================================================
# 10. POS PERFORMANCE : reutilise le moteur analytique reel (3 derniers mois)
#     puis enrichit clients_count pour un rendu plus parlant.
# ===========================================================================
print("\n== Performance POS (moteur analytics) ==")
n_perf = 0
for pid in (2, 3):
    for m in MONTHS[-3:]:
        calculate_pos_performance(db, partner_id=pid, period_start=m, period_end=month_end(m))
        n_perf += db.query(POSPerformance).filter(
            POSPerformance.partner_id == pid,
            POSPerformance.period_start == m).count()
db.query(POSPerformance).update({POSPerformance.clients_count:
                                 POSPerformance.active_sims_count * rng.randint(6, 9)},
                                synchronize_session=False)
db.commit()
print(f"   {n_perf} lignes pos_performance sur 3 mois x 2 partenaires")

# ===========================================================================
# 11. REQUETES MULTI-ENTITES + COMMENTAIRES
# ===========================================================================
print("\n== Requetes terrain ==")
from sqlalchemy import func as _f2
ENTITES_AC = {2: ["AC Akwa", "AC Bepanda", "AC Deido", "Back-office DL", "AC Bonaberi"],
              3: ["AC Yaounde-Centre", "Back-office YDE"]}
TITRES = {
    TypeRequete.AJOUT: "Nouvelle creation de POS",
    TypeRequete.RECONDUCTION: "Renouvellement de contrat POS",
    TypeRequete.DELINKAGE: "Delinkage detenteur POS",
    TypeRequete.BASCULEMENT: "Basculement vers une autre micro-zone",
    TypeRequete.AUTRE: "Incident reseau / divers",
}
REQ_NOTES = [
    "Dossier complet transmis au back-office.",
    "Client relance par telephone sans succes pour le moment.",
    "Pieces justificatives manquantes (CNI du detenteur).",
    "Traite dans le cadre de la tournee hebdomadaire.",
    "En attente de validation finance depuis 48h.",
]
demandeurs_mc = [by_username["manager.mc"], by_username["dsm.mc"], by_username["chef"]]
demandeurs_gl = [by_username["chef.gl"]]
n_req = n_ent = n_com = 0

for pid, pos_list in ((2, mc_pos), (3, gl_pos)):
    demanders = demandeurs_mc if pid == 2 else demandeurs_gl
    partner_pos_ids = [p.id for p in pos_list]
    for k in range(15 if pid == 2 else 8):
        day_off = rng.randint(1, 75)
        created_at = min(rand_dt(TODAY - timedelta(days=day_off)), NOW)
        ttype = rng.choices(list(TypeRequete), weights=[34, 26, 16, 14, 10])[0]
        prio = rng.choices(list(PrioriteRequete), weights=[15, 50, 25, 10])[0]
        demande = rng.randint(1, 12)
        finished = rng.random() < 0.55 and day_off > 12
        if finished:
            rejete = 1 if rng.random() < 0.2 else 0
            effectue = max(demande - rejete, 0)
            delai_h = rng.randint(24, 120)
            fin_at = min(created_at + timedelta(hours=delai_h), NOW)
        else:
            effectue = rng.randint(0, demande - 1)
            rejete, delai_h, fin_at = 0, None, None
        req = Requete(partner_id=pid, dsm_id=None, external_id=f"REQ-EXT-{1000 + n_req}",
                      entite_en_charge=rng.choice(ENTITES_AC[pid]),
                      type_requete=ttype, titre=TITRES[ttype],
                      description=f"{TITRES[ttype]} signalee depuis le terrain "
                                  f"(zone {rng.choice(pos_list).zone}) ; dossier n°{100 + k}.",
                      priorite=prio, date_creation=created_at,
                      nombre_demande=demande, nombre_effectue=effectue,
                      nombre_rejete=rejete, delai=delai_h, date_finalisation=fin_at,
                      demandeur_id=rng.choice([u.id for u in demanders]),
                      responsable_id=admin_id if finished else (chef_id if pid == 2 else chef_gl_id),
                      closed_at=fin_at)
        db.add(req)
        db.flush()
        entity_map = {
            TypeRequete.AJOUT: ("PARTNER", pid),
            TypeRequete.DELINKAGE: ("POS", rng.choice(partner_pos_ids)),
            TypeRequete.RECONDUCTION: ("POS", rng.choice(partner_pos_ids)),
            TypeRequete.BASCULEMENT: ("DSM", rng.choice(DSMS[pid]).id),
            TypeRequete.AUTRE: ("BTS", bts_by_partner[pid][0].id),
        }
        etype, eid = entity_map[ttype]
        db.add(RequeteEntite(requete_id=req.id, entity_type=etype, entity_id=eid))
        n_ent += 1
        author_pool_c = [admin_id, chef_id] if pid == 2 else [admin_id, chef_gl_id]
        for c_idx in range(rng.randint(0, 3)):
            at = min(created_at + timedelta(hours=6 * (c_idx + 1)), NOW)
            db.add(RequeteCommentaire(requete_id=req.id,
                                      author_id=rng.choice(author_pool_c),
                                      commentaire=REQ_NOTES[c_idx % len(REQ_NOTES)],
                                      created_at=at))
            n_com += 1
        n_req += 1
db.commit()

ouvertes_mc = db.query(_f2.count(Requete.id)).filter(
    Requete.partner_id == 2,
    Requete.nombre_effectue + Requete.nombre_rejete < Requete.nombre_demande).scalar()
print(f"   {n_req} requetes | {n_ent} entites rattachees | {n_com} commentaires "
      f"| ouvertes MC : {ouvertes_mc}")

# ===========================================================================
# 12. RAPPORT DE CONTROLE FINAL
# ===========================================================================
print("\n================ RAPPORT ================")
for model in [Partner, User, UserPartner, UserPOS, DSM, MicroZone, PartnerSalesTarget,
              POS, SIM, SIMMovement, BTS, BTSReleve, PrimePeriod, Prime,
              Reconduction, POSPerformance, DSMCommission, Requete]:
    print(f"   {model.__tablename__:<24}: {db.query(model).count()}")

n_en_stock_mc = db.query(SIM).filter(SIM.partner_id == 2, SIM.status == StatutSim.EN_STOCK).count()
alertes = [p.code_pos for p in mc_pos
           if TODAY <= p.date_expiration <= TODAY + timedelta(days=30)]
print(f"\nDashboard Master Color -> POS total : {len(mc_pos)} | "
      f"SIM en stock : {n_en_stock_mc} | alertes expiration (30 j) : {len(alertes)} {alertes}")
print("Holders de demonstration : pos.mc02, pos.gl01... / mot de passe : pos2026")
db.close()
print("\nOK -- base peuplee. Demarrez ensuite le backend : uvicorn app.main:app --reload")












