"""
Verifie les fonctionnalites ajoutees pour combler les ecarts identifies
par rapport au cahier des charges : perimetre complet de l'import
Excel (DSM, SIM, PrimePeriod, BTS, Requete), exposition de
POSPerformance, gestion des utilisateurs par l'ADMIN, et revocation de
jeton (logout).
"""
import io
from datetime import date, timedelta

import pandas as pd

from tests.conftest import auth_headers


def _xlsx(rows: list[dict]) -> bytes:
    buf = io.BytesIO()
    pd.DataFrame(rows).to_csv(buf, index=False)
    return buf.getvalue()


def _validate_and_apply(client, token, partner_id, entity_type, rows):
    files = {"file": ("t.csv", _xlsx(rows), "text/csv")}
    v = client.post(f"/api/partners/{partner_id}/imports/validate",
                     data={"entity_type": entity_type}, files=files, headers=auth_headers(token))
    assert v.status_code == 200, v.text
    batch = v.json()["batch"]
    a = client.post(f"/api/partners/{partner_id}/imports/{batch['id']}/apply", headers=auth_headers(token))
    return v, a


def test_import_dsm_creates_new_dsm(client, rep1_token, seed):
    v, a = _validate_and_apply(client, rep1_token, seed["p1"], "DSM",
                                [{"matricule": "T-DSM-IMP", "full_name": "DSM Importe", "zone": "Zone Test"}])
    assert v.json()["batch"]["status"] == "VALIDATED"
    assert a.status_code == 200
    assert a.json()["applied_rows"] == 1


def test_import_sim_creates_new_sim(client, rep1_token, seed):
    v, a = _validate_and_apply(client, rep1_token, seed["p1"], "SIM",
                                [{"iccid": "8923700000000099999", "pos_code": "T-POS-1"}])
    assert v.json()["batch"]["status"] == "VALIDATED"
    assert a.status_code == 200
    assert a.json()["applied_rows"] == 1

    resp = client.get(f"/api/partners/{seed['p1']}/sim", headers=auth_headers(rep1_token))
    iccids = [s["iccid"] for s in resp.json()["items"]]
    assert "8923700000000099999" in iccids


def test_import_prime_period_creates_new_period(client, rep1_token, seed):
    v, a = _validate_and_apply(client, rep1_token, seed["p1"], "PRIME_PERIOD", [{
        "code": "T-PER-IMP", "label": "Periode importee",
        "start_date": "2026-09-01", "end_date": "2026-09-30",
    }])
    assert v.json()["batch"]["status"] == "VALIDATED"
    assert a.status_code == 200

    resp = client.get(f"/api/partners/{seed['p1']}/prime-periods", headers=auth_headers(rep1_token))
    codes = [p["code"] for p in resp.json()]
    assert "T-PER-IMP" in codes


def test_import_bts_creates_new_bts(client, rep1_token, seed):
    v, a = _validate_and_apply(client, rep1_token, seed["p1"], "BTS",
                                [{"code_bts": "T-BTS-IMP", "operateur": "OpImport", "technologie": "5G"}])
    assert v.json()["batch"]["status"] == "VALIDATED"
    assert a.status_code == 200
    resp = client.get(f"/api/partners/{seed['p1']}/bts", headers=auth_headers(rep1_token))
    codes = [b["code_bts"] for b in resp.json()["items"]]
    assert "T-BTS-IMP" in codes


def test_import_requete_creates_new_requete_with_external_id(client, rep1_token, seed):
    v, a = _validate_and_apply(client, rep1_token, seed["p1"], "REQUETE", [{
        "external_id": "EXT-REQ-001", "type_requete": "AUTRE", "titre": "Requete importee",
    }])
    assert v.json()["batch"]["status"] == "VALIDATED"
    assert a.status_code == 200
    resp = client.get(f"/api/partners/{seed['p1']}/requests", headers=auth_headers(rep1_token))
    titres = [r["titre"] for r in resp.json()["items"]]
    assert "Requete importee" in titres


def test_import_partner_rejects_mismatched_code(client, rep1_token, seed):
    # code_partenaire ne correspondant pas au Partenaire de contexte -> erreur
    v, _ = _validate_and_apply(client, rep1_token, seed["p1"], "PARTNER",
                                [{"code_partenaire": "CODE-INCONNU", "name": "Tentative"}])
    assert v.json()["batch"]["status"] == "FAILED"
    assert len(v.json()["errors"]) >= 1


def test_pos_performance_calculate_and_list(client, rep1_token, seed):
    today = date.today()
    calc = client.post(
        f"/api/partners/{seed['p1']}/analytics/pos-performance/calculate",
        json={"period_start": str(today - timedelta(days=30)), "period_end": str(today)},
        headers=auth_headers(rep1_token),
    )
    assert calc.status_code == 201
    assert len(calc.json()) >= 1

    listed = client.get(f"/api/partners/{seed['p1']}/analytics/pos-performance", headers=auth_headers(rep1_token))
    assert listed.status_code == 200
    assert listed.json()["total"] >= 1


def test_analytics_commissions_route_matches_architecture_spec(client, rep1_token, seed):
    resp = client.get(f"/api/partners/{seed['p1']}/analytics/commissions", headers=auth_headers(rep1_token))
    assert resp.status_code == 200
    assert "items" in resp.json()


def test_admin_can_list_and_update_users(client, admin_token, seed):
    listed = client.get("/api/auth/users", headers=auth_headers(admin_token))
    assert listed.status_code == 200
    assert listed.json()["total"] >= 3

    update = client.patch(
        f"/api/auth/users/{seed['rep1_id']}", json={"full_name": "Nom mis a jour"},
        headers=auth_headers(admin_token),
    )
    assert update.status_code == 200
    assert update.json()["full_name"] == "Nom mis a jour"


def test_non_admin_cannot_list_users(client, rep1_token):
    resp = client.get("/api/auth/users", headers=auth_headers(rep1_token))
    assert resp.status_code == 403


def test_logout_revokes_current_token(client, seed):
    login = client.post("/api/auth/login", json={"username": "t_rep1", "password": "Pwd@Test1234"})
    assert login.status_code == 200
    token = login.json()["access_token"]

    ok = client.get("/api/auth/me", headers=auth_headers(token))
    assert ok.status_code == 200

    logout = client.post("/api/auth/logout", headers=auth_headers(token))
    assert logout.status_code == 204

    after_logout = client.get("/api/auth/me", headers=auth_headers(token))
    assert after_logout.status_code == 401


def test_refresh_token_rotation_and_revocation(client, seed):
    login = client.post("/api/auth/login", json={"username": "t_rep1", "password": "Pwd@Test1234"})
    refresh_token_1 = login.json()["refresh_token"]

    # Premier usage : doit reussir et emettre un nouveau refresh token.
    refreshed = client.post("/api/auth/refresh", json={"refresh_token": refresh_token_1})
    assert refreshed.status_code == 200
    refresh_token_2 = refreshed.json()["refresh_token"]
    assert refresh_token_2 != refresh_token_1

    # Rejouer l'ancien refresh token doit desormais echouer (rotation).
    replay = client.post("/api/auth/refresh", json={"refresh_token": refresh_token_1})
    assert replay.status_code == 401

    # Le nouveau refresh token, lui, doit encore fonctionner.
    still_valid = client.post("/api/auth/refresh", json={"refresh_token": refresh_token_2})
    assert still_valid.status_code == 200


def test_logout_can_also_revoke_refresh_token(client, seed):
    login = client.post("/api/auth/login", json={"username": "t_rep1", "password": "Pwd@Test1234"})
    access_token = login.json()["access_token"]
    refresh_token = login.json()["refresh_token"]

    logout = client.post("/api/auth/logout", json={"refresh_token": refresh_token},
                          headers=auth_headers(access_token))
    assert logout.status_code == 204

    refresh_attempt = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh_attempt.status_code == 401


def test_login_locks_after_too_many_failed_attempts(client):
    from app.security.login_guard import _failed_attempts, _locked_until

    username = "t_dsm1"
    _failed_attempts.pop(username, None)
    _locked_until.pop(username, None)

    for _ in range(5):
        resp = client.post("/api/auth/login", json={"username": username, "password": "MauvaisMotDePasse"})
        assert resp.status_code == 401

    # Meme avec le BON mot de passe, le compte doit rester verrouille.
    locked_attempt = client.post("/api/auth/login", json={"username": username, "password": "Pwd@Test1234"})
    assert locked_attempt.status_code == 401
    assert "tentatives" in locked_attempt.json()["detail"].lower()

    _failed_attempts.pop(username, None)
    _locked_until.pop(username, None)


def test_import_dsm_rejects_missing_full_name(client, rep1_token, seed):
    v, _ = _validate_and_apply(client, rep1_token, seed["p1"], "DSM", [{"matricule": "T-DSM-BAD", "full_name": ""}])
    assert v.json()["batch"]["status"] == "FAILED"
    assert any(e["field"] == "full_name" for e in v.json()["errors"])


def test_import_bts_rejects_empty_code(client, rep1_token, seed):
    # Une ligne dont TOUTES les cellules sont vides disparait au
    # roundtrip Excel (openpyxl n'ecrit aucune donnee pour une ligne
    # entierement blanche) : on inclut donc une colonne annexe non
    # vide pour que la ligne survive et exerce reellement la
    # validation de code_bts.
    v, _ = _validate_and_apply(client, rep1_token, seed["p1"], "BTS",
                                [{"code_bts": "", "operateur": "OperateurTest"}])
    assert v.json()["batch"]["status"] == "FAILED"
    assert any(e["field"] == "code_bts" for e in v.json()["errors"])


def test_import_sim_rejects_unknown_pos(client, rep1_token, seed):
    v, _ = _validate_and_apply(client, rep1_token, seed["p1"], "SIM",
                                [{"iccid": "8923700000000088888", "pos_code": "POS-INEXISTANT"}])
    assert v.json()["batch"]["status"] == "FAILED"
    assert any(e["field"] == "pos_code" for e in v.json()["errors"])


def test_import_prime_period_rejects_invalid_date_range(client, rep1_token, seed):
    v, _ = _validate_and_apply(client, rep1_token, seed["p1"], "PRIME_PERIOD", [{
        "code": "T-PER-BAD", "label": "Periode invalide",
        "start_date": "2026-09-30", "end_date": "2026-09-01",
    }])
    assert v.json()["batch"]["status"] == "FAILED"
    assert any(e["field"] == "end_date" for e in v.json()["errors"])


def test_import_prime_rejects_unknown_period(client, rep1_token, seed):
    v, _ = _validate_and_apply(client, rep1_token, seed["p1"], "PRIME", [{
        "pos_code": "T-POS-1", "prime_period_code": "PERIODE-INEXISTANTE", "montant": 10000,
    }])
    assert v.json()["batch"]["status"] == "FAILED"
    assert any(e["field"] == "prime_period_code" for e in v.json()["errors"])


def test_import_prime_rejects_negative_montant(client, rep1_token, seed):
    v, _ = _validate_and_apply(client, rep1_token, seed["p1"], "PRIME", [{
        "pos_code": "T-POS-1", "prime_period_code": "T-PER1", "montant": -500,
    }])
    assert v.json()["batch"]["status"] == "FAILED"
    assert any(e["field"] == "montant" for e in v.json()["errors"])


def test_import_requete_rejects_invalid_type(client, rep1_token, seed):
    v, _ = _validate_and_apply(client, rep1_token, seed["p1"], "REQUETE", [{
        "external_id": "EXT-BAD-1", "type_requete": "TYPE_INCONNU", "titre": "Requete invalide",
    }])
    assert v.json()["batch"]["status"] == "FAILED"
    assert any(e["field"] == "type_requete" for e in v.json()["errors"])


def test_import_unsupported_entity_type_is_rejected(client, rep1_token, seed):
    files = {"file": ("t.xlsx", _xlsx([{"a": 1}]),
                       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    resp = client.post(f"/api/partners/{seed['p1']}/imports/validate",
                        data={"entity_type": "TYPE_FANTAISISTE"}, files=files, headers=auth_headers(rep1_token))
    assert resp.status_code == 422


def test_import_dsm_updates_existing_dsm_on_reimport(client, rep1_token, seed):
    rows = [{"matricule": "T-DSM-UPD", "full_name": "Nom Initial", "zone": "Zone A"}]
    _validate_and_apply(client, rep1_token, seed["p1"], "DSM", rows)

    rows2 = [{"matricule": "T-DSM-UPD", "full_name": "Nom Mis A Jour", "zone": "Zone B"}]
    v2, a2 = _validate_and_apply(client, rep1_token, seed["p1"], "DSM", rows2)
    assert v2.json()["batch"]["status"] == "VALIDATED"
    assert a2.status_code == 200

    listed = client.get("/api/admin/dsm", params={"partner_id": seed["p1"]}, headers=auth_headers(admin_token))
    names = [d["full_name"] for d in listed.json()]
    assert "Nom Mis A Jour" in names
    assert "Nom Initial" not in names
