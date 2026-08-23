"""
analytics_service : agrege des donnees deja filtrees par Partenaire,
sans jamais contourner les autorisations (le filtrage est fait en amont
par le PartnerContext dans les routes API).

Optimisation : le cahier des charges (section 11 - Exigences non
fonctionnelles) impose un temps de reponse API inferieur a 500 ms au
percentile 95 sur les lectures usuelles du dashboard, pour un jeu de
test de 10 000 POS. Toutes les fonctions de ce module sont ecrites
pour executer un nombre de requetes SQL CONSTANT, independant du
nombre de POS/BTS/DSM du Partenaire (pas de boucle Python emettant une
requete par ligne -- voir le commentaire sur bts_saturees et
calculate_pos_performance, qui remplacent d'anciennes implementations
en N+1 requetes).
"""
from datetime import date, timedelta

from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.core.config import settings
from app.core.errors import NotFoundError
from app.models.partner import Partner
from app.models.dsm import DSM
from app.models.pos import POS, TypePos
from app.models.prime import Prime, StatutPrime
from app.models.requete import Requete
from app.models.bts import BTS
from app.models.bts_releve import BTSReleve
from app.models.sim import SIM, StatutSim
from app.models.pos_performance import POSPerformance, SourcePerformance

# Nombre maximum d'alertes d'expiration renvoyees par le dashboard : le
# dashboard est une vue de synthese, pas une liste exhaustive -- au-dela,
# l'utilisateur consulte le module POS filtre par date d'expiration.
MAX_DASHBOARD_EXPIRATION_ALERTS = 20


def get_dashboard(db: Session, partner_id: int) -> dict:
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise NotFoundError("Partenaire introuvable.")

    # POS : un seul aller-retour SQL pour le total et la repartition
    # Nouveau/Reconduit (GROUP BY plutot que 2 requetes COUNT separees).
    pos_counts = dict(
        db.query(POS.type_pos, func.count(POS.id))
        .filter(POS.partner_id == partner_id)
        .group_by(POS.type_pos)
        .all()
    )
    pos_nouveau = pos_counts.get(TypePos.NOUVEAU, 0)
    pos_reconduit = pos_counts.get(TypePos.RECONDUIT, 0)
    pos_total = pos_nouveau + pos_reconduit

    # Primes : un seul aller-retour SQL pour les compteurs par statut.
    prime_counts = dict(
        db.query(Prime.status, func.count(Prime.id))
        .join(POS)
        .filter(POS.partner_id == partner_id)
        .group_by(Prime.status)
        .all()
    )
    primes_en_attente = prime_counts.get(StatutPrime.EN_ATTENTE, 0)
    primes_validees = prime_counts.get(StatutPrime.VALIDEE, 0)

    montant_primes = db.query(func.coalesce(func.sum(Prime.montant), 0)).join(POS).filter(
        POS.partner_id == partner_id,
        Prime.status.in_([StatutPrime.VALIDEE, StatutPrime.PAYEE]),
    ).scalar() or 0

    # Requetes ouvertes : derive des compteurs de traitement plutoit qu'un
    # StatutRequete (retire). Une requete est "ouverte" tant qu'il reste
    # des demandes non traitees (effectue + rejete < demande).
    requetes_ouvertes = db.query(func.count(Requete.id)).filter(
        Requete.partner_id == partner_id,
        Requete.nombre_effectue + Requete.nombre_rejete < Requete.nombre_demande,
    ).scalar() or 0

    # BTS proches / au-dela du seuil de saturation, sur leur DERNIER releve
    # uniquement. Optimisation : une sous-requete correlee (MAX(date_releve)
    # par bts_id) rejointe une seule fois, au lieu d'une requete par BTS
    # (l'ancienne implementation etait O(n) requetes pour n BTS -- ici,
    # 1 seule requete SQL quel que soit le nombre de BTS).
    latest_releve_dates = (
        db.query(
            BTSReleve.bts_id.label("bts_id"),
            func.max(BTSReleve.date_releve).label("max_date"),
        )
        .group_by(BTSReleve.bts_id)
        .subquery()
    )
    bts_saturees = (
        db.query(func.count(func.distinct(BTS.id)))
        .join(latest_releve_dates, latest_releve_dates.c.bts_id == BTS.id)
        .join(
            BTSReleve,
            and_(
                BTSReleve.bts_id == latest_releve_dates.c.bts_id,
                BTSReleve.date_releve == latest_releve_dates.c.max_date,
            ),
        )
        .filter(BTS.partner_id == partner_id, BTSReleve.taux_saturation >= settings.BTS_SATURATION_THRESHOLD)
        .scalar() or 0
    )

    # SIM : un seul aller-retour SQL pour les compteurs par statut.
    sim_counts = dict(
        db.query(SIM.status, func.count(SIM.id))
        .filter(SIM.partner_id == partner_id)
        .group_by(SIM.status)
        .all()
    )
    sim_en_stock = sim_counts.get(StatutSim.EN_STOCK, 0)
    sim_assignees = sim_counts.get(StatutSim.ASSIGNEE, 0)

    # Alertes d'expiration POS : POS actifs dont l'echeance approche
    # (Jour 12 de la roadmap - notifications). Limitees a
    # MAX_DASHBOARD_EXPIRATION_ALERTS pour garder une charge utile
    # constante quel que soit le nombre de POS du Partenaire.
    today = date.today()
    horizon = today + timedelta(days=settings.POS_EXPIRATION_ALERT_DAYS)
    pos_a_risque = (
        db.query(POS)
        .filter(POS.partner_id == partner_id, POS.date_expiration <= horizon, POS.date_expiration >= today)
        .order_by(POS.date_expiration.asc())
        .limit(MAX_DASHBOARD_EXPIRATION_ALERTS)
        .all()
    )
    pos_expirations_proches = [
        {
            "pos_id": p.id,
            "code_pos": p.code_pos,
            "name": p.name,
            "date_expiration": p.date_expiration.isoformat(),
            "jours_restants": (p.date_expiration - today).days,
        }
        for p in pos_a_risque
    ]

    return {
        "partner_id": partner.id,
        "partner_name": partner.name,
        "pos_total": pos_total,
        "pos_nouveau": pos_nouveau,
        "pos_reconduit": pos_reconduit,
        "primes_en_attente": primes_en_attente,
        "primes_validees": primes_validees,
        "montant_primes_periode": montant_primes,
        "requetes_ouvertes": requetes_ouvertes,
        "bts_saturees": bts_saturees,
        "sim_en_stock": sim_en_stock,
        "sim_assignees": sim_assignees,
        "pos_expirations_proches": pos_expirations_proches,
    }


def get_dsm_dashboard(db: Session, partner_id: int, dsm_id: int) -> dict:
    dsm = db.query(DSM).filter(DSM.id == dsm_id, DSM.partner_id == partner_id).first()
    if not dsm:
        raise NotFoundError("DSM introuvable dans ce Partenaire.")

    pos_ids = [pid for (pid,) in db.query(POS.id).filter(POS.partner_id == partner_id, POS.dsm_id == dsm_id).all()]
    pos_counts = dict(
        db.query(POS.type_pos, func.count(POS.id))
        .filter(POS.partner_id == partner_id, POS.dsm_id == dsm_id)
        .group_by(POS.type_pos)
        .all()
    )
    pos_nouveau = pos_counts.get(TypePos.NOUVEAU, 0)
    pos_reconduit = pos_counts.get(TypePos.RECONDUIT, 0)
    pos_total = pos_nouveau + pos_reconduit

    prime_counts = dict(
        db.query(Prime.status, func.count(Prime.id))
        .join(POS)
        .filter(POS.partner_id == partner_id, POS.dsm_id == dsm_id)
        .group_by(Prime.status)
        .all()
    )
    primes_en_attente = prime_counts.get(StatutPrime.EN_ATTENTE, 0)
    primes_validees = prime_counts.get(StatutPrime.VALIDEE, 0)
    montant_primes = db.query(func.coalesce(func.sum(Prime.montant), 0)).join(POS).filter(
        POS.partner_id == partner_id,
        POS.dsm_id == dsm_id,
        Prime.status.in_([StatutPrime.VALIDEE, StatutPrime.PAYEE]),
    ).scalar() or 0

    requetes_ouvertes = db.query(func.count(Requete.id)).filter(
        Requete.partner_id == partner_id,
        Requete.entites.any(),
    ).scalar() or 0

    bts_saturees = db.query(func.count(BTS.id)).filter(BTS.partner_id == partner_id).scalar() or 0
    sim_en_stock = db.query(func.count(SIM.id)).filter(
        SIM.partner_id == partner_id,
        SIM.status == StatutSim.EN_STOCK,
        SIM.pos_id.is_(None),
        SIM.status != StatutSim.ASSIGNEE,
    ).scalar() or 0
    sim_assignees = db.query(func.count(SIM.id)).join(POS, SIM.pos_id == POS.id).filter(
        POS.partner_id == partner_id,
        POS.dsm_id == dsm_id,
        SIM.status == StatutSim.ASSIGNEE,
    ).scalar() or 0

    return {
        "dsm_id": dsm.id,
        "dsm_name": dsm.nom if hasattr(dsm, "nom") else getattr(dsm, "full_name", f"DSM #{dsm.id}"),
        "partner_id": partner_id,
        "partner_name": db.query(Partner.name).filter(Partner.id == partner_id).scalar() or "",
        "pos_total": pos_total,
        "pos_nouveau": pos_nouveau,
        "pos_reconduit": pos_reconduit,
        "primes_en_attente": primes_en_attente,
        "primes_validees": primes_validees,
        "montant_primes_periode": montant_primes,
        "requetes_ouvertes": requetes_ouvertes,
        "bts_saturees": bts_saturees,
        "sim_en_stock": sim_en_stock,
        "sim_assignees": sim_assignees,
        "pos_expirations_proches": [],
    }


def calculate_pos_performance(db: Session, *, partner_id: int, period_start: date, period_end: date) -> list[POSPerformance]:
    """
    Calcule (ou met a jour) les indicateurs de performance de chaque POS
    actif du Partenaire pour la periode donnee : nombre de SIM actives sur
    la periode. Alimente la table POSPerformance avec source=CALCUL.

    Optimisation : agrege les SIM actives par pos_id en 1 requete GROUP BY
    (au lieu d'une requete par POS), puis merge en memoire -- le nombre de
    requetes SQL reste constant quel que soit le nombre de POS.
    """
    pos_ids = [pid for (pid,) in db.query(POS.id).filter(POS.partner_id == partner_id).all()]
    if not pos_ids:
        return []

    active_sims_by_pos = dict(
        db.query(SIM.pos_id, func.count(SIM.id))
        .filter(SIM.pos_id.in_(pos_ids), SIM.status == StatutSim.ACTIVE)
        .group_by(SIM.pos_id)
        .all()
    )
    existing_by_pos = {
        perf.pos_id: perf
        for perf in db.query(POSPerformance).filter(
            POSPerformance.pos_id.in_(pos_ids),
            POSPerformance.period_start == period_start,
            POSPerformance.period_end == period_end,
        ).all()
    }

    to_insert = []
    to_update = []
    for pos_id in pos_ids:
        active_sims_count = active_sims_by_pos.get(pos_id, 0)
        score = float(active_sims_count) * 0.5

        existing = existing_by_pos.get(pos_id)
        if existing:
            to_update.append({
                "id": existing.id,
                "active_sims_count": active_sims_count,
                "performance_score": score,
                "source": SourcePerformance.CALCUL,
            })
        else:
            to_insert.append({
                "partner_id": partner_id, "pos_id": pos_id,
                "period_start": period_start, "period_end": period_end,
                "active_sims_count": active_sims_count,
                "performance_score": score, "source": SourcePerformance.CALCUL,
            })

    # Ecritures en masse (executemany) plutot qu'un cycle add()/commit()
    # par ligne, pour reduire les allers-retours avec la base sur un
    # gros volume de POS.
    if to_update:
        db.bulk_update_mappings(POSPerformance, to_update)
    if to_insert:
        db.bulk_insert_mappings(POSPerformance, to_insert)
    db.commit()

    # Une seule requete de relecture (plutot que N db.refresh() -- qui
    # emettraient chacun un SELECT) pour recuperer les valeurs generees
    # par la base (id, created_at) sur les lignes nouvellement creees.
    return (
        db.query(POSPerformance)
        .filter(
            POSPerformance.pos_id.in_(pos_ids),
            POSPerformance.period_start == period_start,
            POSPerformance.period_end == period_end,
        )
        .all()
    )
