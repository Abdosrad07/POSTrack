"""
Verifie le module BTS (releves, seuil de saturation) et les
permissions par role sur des routes sensibles (creation de Partenaire
reservee a l'ADMIN, import reserve aux roles autorises).
"""
from tests.conftest import auth_headers


def test_bts_releve_and_saturation_alert_on_dashboard(client, rep1_token, seed):
    bts_resp = client.post(
        f"/api/partners/{seed['p1']}/bts",
        json={"code_bts": "T-BTS-1", "operateur": "OperateurTest", "technologie": "4G"},
        headers=auth_headers(rep1_token),
    )
    assert bts_resp.status_code == 201
    bts_id = bts_resp.json()["id"]

    releve_resp = client.post(
        f"/api/partners/{seed['p1']}/bts/{bts_id}/releves",
        json={"charge": 950, "taux_saturation": 95, "rendement": 70, "commentaire": "Pic de charge"},
        headers=auth_headers(rep1_token),
    )
    assert releve_resp.status_code == 201

    dashboard = client.get(f"/api/partners/{seed['p1']}/analytics/dashboard", headers=auth_headers(rep1_token))
    assert dashboard.status_code == 200
    assert dashboard.json()["bts_saturees"] >= 1


def test_bts_releve_rejects_negative_value(client, rep1_token, seed):
    bts_resp = client.post(
        f"/api/partners/{seed['p1']}/bts",
        json={"code_bts": "T-BTS-2"},
        headers=auth_headers(rep1_token),
    )
    bts_id = bts_resp.json()["id"]

    resp = client.post(
        f"/api/partners/{seed['p1']}/bts/{bts_id}/releves",
        json={"charge": -10, "taux_saturation": 50, "rendement": 80},
        headers=auth_headers(rep1_token),
    )
    assert resp.status_code == 422


def test_only_admin_can_create_partner(client, rep1_token, admin_token):
    forbidden = client.post(
        "/api/admin/partners", json={"code": "T-P-NEW", "name": "Nouveau Partenaire"},
        headers=auth_headers(rep1_token),
    )
    assert forbidden.status_code == 403

    allowed = client.post(
        "/api/admin/partners", json={"code": "T-P-NEW", "name": "Nouveau Partenaire"},
        headers=auth_headers(admin_token),
    )
    assert allowed.status_code == 201


def test_duplicate_code_bts_is_rejected(client, rep1_token, seed):
    payload = {"code_bts": "T-BTS-DUP", "operateur": "OperateurTest"}
    first = client.post(f"/api/partners/{seed['p1']}/bts", json=payload, headers=auth_headers(rep1_token))
    assert first.status_code == 201

    duplicate = client.post(f"/api/partners/{seed['p1']}/bts", json=payload, headers=auth_headers(rep1_token))
    assert duplicate.status_code == 409
