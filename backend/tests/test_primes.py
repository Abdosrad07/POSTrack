"""
Verifie le scenario metier critique : POS Nouveau -> Prime -> Validation
ADMIN -> Reconduction -> Prime bloquee. Verifie aussi l'unicite de la
prime par POS et la restriction de la validation a l'ADMIN.
"""
from datetime import date, timedelta

from tests.conftest import auth_headers


def test_prime_validation_requires_admin_role(client, rep1_token, admin_token, seed):
    # Calcul des primes sur la periode ouverte : pos1 (Nouveau, sans prime) est eligible.
    # D'autres POS Nouveau peuvent exister a ce stade (crees par d'autres
    # tests partageant le meme Partenaire de session) : on cible donc
    # specifiquement la prime generee pour pos1 plutot que le total.
    calc = client.post(
        f"/api/partners/{seed['p1']}/primes/calculate",
        json={"prime_period_id": seed["period"], "montant_fixe": 50000},
        headers=auth_headers(rep1_token),
    )
    assert calc.status_code == 201
    primes_creees = calc.json()["primes_creees"]
    prime_pos1 = next((p for p in primes_creees if p["pos_id"] == seed["pos1"]), None)
    assert prime_pos1 is not None, "Aucune prime generee pour pos1 (POS Nouveau attendu eligible)."
    assert prime_pos1["status"] == "EN_ATTENTE"
    prime_id = prime_pos1["id"]

    # Un Representant Partenaire ne peut pas valider une prime (reserve a l'ADMIN)
    forbidden = client.patch(
        f"/api/partners/{seed['p1']}/primes/{prime_id}/status",
        json={"status": "VALIDEE"},
        headers=auth_headers(rep1_token),
    )
    assert forbidden.status_code == 403

    # L'ADMIN peut valider
    validated = client.patch(
        f"/api/partners/{seed['p1']}/primes/{prime_id}/status",
        json={"status": "VALIDEE"},
        headers=auth_headers(admin_token),
    )
    assert validated.status_code == 200
    assert validated.json()["status"] == "VALIDEE"


def test_no_duplicate_prime_and_blocked_after_reconduction(client, rep1_token, admin_token, seed):
    # A ce stade (apres le test precedent), pos1 a deja une prime VALIDEE.
    # Un nouveau calcul sur la meme periode ne doit produire aucune
    # nouvelle prime pour pos1 (unicite).
    recalc = client.post(
        f"/api/partners/{seed['p1']}/primes/calculate",
        json={"prime_period_id": seed["period"], "montant_fixe": 50000},
        headers=auth_headers(rep1_token),
    )
    assert recalc.status_code == 201
    assert all(p["pos_id"] != seed["pos1"] for p in recalc.json()["primes_creees"])

    # Reconduction du POS : desormais RECONDUIT, definitivement inéligible
    reconduction = client.post(
        f"/api/partners/{seed['p1']}/pos/{seed['pos1']}/reconduction",
        json={"new_expiration": str(date.today() + timedelta(days=600)), "motif": "Renouvellement"},
        headers=auth_headers(rep1_token),
    )
    assert reconduction.status_code == 201

    pos_resp = client.get(f"/api/partners/{seed['p1']}/pos/{seed['pos1']}", headers=auth_headers(rep1_token))
    assert pos_resp.json()["type_pos"] == "RECONDUIT"

    # Un nouveau calcul ne doit toujours rien produire pour pos1
    recalc2 = client.post(
        f"/api/partners/{seed['p1']}/primes/calculate",
        json={"prime_period_id": seed["period"], "montant_fixe": 50000},
        headers=auth_headers(rep1_token),
    )
    assert recalc2.status_code == 201
    assert all(p["pos_id"] != seed["pos1"] for p in recalc2.json()["primes_creees"])


def test_commission_dsm_created_alongside_prime(client, rep1_token, seed):
    resp = client.get(
        f"/api/partners/{seed['p1']}/primes/commissions",
        params={"period_id": seed["period"]},
        headers=auth_headers(rep1_token),
    )
    assert resp.status_code == 200
    commissions = resp.json()
    assert len(commissions) == 1
    assert commissions[0]["dsm_id"] == seed["dsm1"]


def test_list_primes_filters_by_period_and_status(client, rep1_token, admin_token, seed):
    # A ce stade de la session, pos1 possede une prime VALIDEE sur seed["period"].
    by_period = client.get(
        f"/api/partners/{seed['p1']}/primes", params={"period_id": seed["period"]},
        headers=auth_headers(rep1_token),
    )
    assert by_period.status_code == 200
    assert all(p["prime_period_id"] == seed["period"] for p in by_period.json()["items"])

    by_status = client.get(
        f"/api/partners/{seed['p1']}/primes", params={"status": "VALIDEE"},
        headers=auth_headers(rep1_token),
    )
    assert by_status.status_code == 200
    assert all(p["status"] == "VALIDEE" for p in by_status.json()["items"])

    combined = client.get(
        f"/api/partners/{seed['p1']}/primes",
        params={"period_id": seed["period"], "status": "REJETEE"},
        headers=auth_headers(rep1_token),
    )
    assert combined.status_code == 200
    assert combined.json()["items"] == []
