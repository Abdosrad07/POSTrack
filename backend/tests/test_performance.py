"""
Verifie que les endpoints de synthese (Dashboard, calcul de
performance POS) executent un nombre de requetes SQL CONSTANT, quel
que soit le nombre de POS/BTS du Partenaire -- exigence indirecte du
cahier des charges (section 11 : temps de reponse < 500ms au p95 pour
10 000 POS, ce qui exclut toute boucle emettant une requete par ligne).

La technique : on compte les requetes SQL emises (event SQLAlchemy
"before_cursor_execute") pour un Partenaire avec peu de donnees, puis
pour un Partenaire avec beaucoup plus de donnees, et on verifie que le
nombre de requetes ne croit pas avec le volume (a une marge pres).
"""
from datetime import date, timedelta

from sqlalchemy import event

from app.core.database import engine, SessionLocal
from app.models.partner import Partner
from app.models.dsm import DSM
from app.models.pos import POS, TypePos
from app.models.bts import BTS
from app.models.bts_releve import BTSReleve

from tests.conftest import auth_headers


def _count_queries(callable_fn) -> int:
    count = {"n": 0}

    def _before_cursor_execute(*args, **kwargs):
        count["n"] += 1

    event.listen(engine, "before_cursor_execute", _before_cursor_execute)
    try:
        callable_fn()
    finally:
        event.remove(engine, "before_cursor_execute", _before_cursor_execute)
    return count["n"]


def _create_partner_with_bts(n_bts: int) -> int:
    db = SessionLocal()
    partner = Partner(code=f"PERF-{n_bts}", name=f"Partenaire perf {n_bts} BTS")
    db.add(partner)
    db.commit()
    db.refresh(partner)

    for i in range(n_bts):
        bts = BTS(partner_id=partner.id, code_bts=f"PERF-BTS-{n_bts}-{i}")
        db.add(bts)
        db.commit()
        db.refresh(bts)
        db.add(BTSReleve(bts_id=bts.id, charge=100, taux_saturation=50, rendement=90))
        db.commit()

    partner_id = partner.id
    db.close()
    return partner_id


def test_dashboard_query_count_does_not_scale_with_bts_volume(client, admin_token, seed):
    small_partner_id = _create_partner_with_bts(2)
    large_partner_id = _create_partner_with_bts(30)

    def call_small():
        client.get(f"/api/partners/{small_partner_id}/analytics/dashboard", headers=auth_headers(admin_token))

    def call_large():
        client.get(f"/api/partners/{large_partner_id}/analytics/dashboard", headers=auth_headers(admin_token))

    queries_small = _count_queries(call_small)
    queries_large = _count_queries(call_large)

    # Avec l'ancienne implementation en N+1, 30 BTS auraient produit
    # ~30 requetes de plus que 2 BTS. Avec la version optimisee, le
    # nombre de requetes doit rester quasi identique (marge de 2 pour
    # les aleas de connexion/transaction).
    assert queries_large <= queries_small + 2, (
        f"Le dashboard semble executer une requete par BTS (N+1) : "
        f"{queries_small} requetes pour 2 BTS vs {queries_large} pour 30 BTS."
    )


def test_pos_performance_calculate_query_count_does_not_scale_with_pos_volume(client, rep1_token, seed):
    today = date.today()
    period = {"period_start": str(today - timedelta(days=30)), "period_end": str(today)}

    def call_calculate():
        client.post(f"/api/partners/{seed['p1']}/analytics/pos-performance/calculate",
                     json=period, headers=auth_headers(rep1_token))

    # Le Partenaire de seed a deja au moins 1 POS ; on ajoute des POS
    # supplementaires pour verifier que le nombre de requetes ne
    # croit pas proportionnellement.
    queries_before = _count_queries(call_calculate)

    db = SessionLocal()
    dsm1 = db.query(DSM).filter(DSM.id == seed["dsm1"]).first()
    for i in range(15):
        db.add(POS(
            code_pos=f"PERF-POS-{i}", name=f"POS perf {i}", partner_id=seed["p1"], dsm_id=dsm1.id,
            type_pos=TypePos.NOUVEAU, date_creation=today, date_expiration=today + timedelta(days=200),
        ))
    db.commit()
    db.close()

    queries_after = _count_queries(call_calculate)

    assert queries_after <= queries_before + 2, (
        f"Le calcul de performance POS semble executer des requetes par POS (N+1) : "
        f"{queries_before} requetes avant, {queries_after} apres ajout de 15 POS."
    )
