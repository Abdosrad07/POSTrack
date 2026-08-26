"""
Verifie le module SIM : creation avec decroissance du stock_actuel du POS,
blocage quand le stock est epuise, unicite de l'ICCID, et les mouvements
de stock (reception, vente, activation, retour, perte).
"""
from datetime import date, timedelta

from tests.conftest import auth_headers


def _create_pos(client, token, partner_id, dsm_id, code, stock):
    payload = {
        "code_pos": code, "name": "POS SIM Test", "dsm_id": dsm_id,
        "date_creation": str(date.today()),
        "date_expiration": str(date.today() + timedelta(days=200)),
        "stock_initial": stock, "stock_actuel": stock,
    }
    resp = client.post(f"/api/partners/{partner_id}/pos", json=payload, headers=auth_headers(token))
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


def test_create_sim_and_reject_duplicate_iccid(client, oper_token, seed):
    payload = {"pos_id": seed["pos1"], "iccid": "8923700000000012345", "numero_msisdn": "699123456"}
    before = client.get(f"/api/partners/{seed['p1']}/pos/{seed['pos1']}", headers=auth_headers(oper_token))
    before_stock = before.json()["stock_actuel"]
    first = client.post(f"/api/partners/{seed['p1']}/sim", json=payload, headers=auth_headers(oper_token))
    assert first.status_code == 201
    assert first.json()["status"] == "EN_STOCK"
    assert first.json()["numero_msisdn"] == "699123456"

    # Le stock doit diminuer d'une unité.
    pos = client.get(f"/api/partners/{seed['p1']}/pos/{seed['pos1']}", headers=auth_headers(oper_token))
    assert pos.json()["stock_actuel"] == before_stock - 1

    duplicate = client.post(f"/api/partners/{seed['p1']}/sim", json=payload, headers=auth_headers(oper_token))
    assert duplicate.status_code == 409


def test_create_sim_blocks_when_stock_exhausted(client, oper_token, seed):
    pos_id = _create_pos(client, oper_token, seed["p1"], seed["dsm1"], "T-POS-SIM-0", stock=1)

    ok = client.post(f"/api/partners/{seed['p1']}/sim",
                     json={"pos_id": pos_id, "iccid": "8923700000000099100", "numero_msisdn": "699111111"},
                     headers=auth_headers(oper_token))
    assert ok.status_code == 201

    blocked = client.post(f"/api/partners/{seed['p1']}/sim",
                          json={"pos_id": pos_id, "iccid": "8923700000000099101", "numero_msisdn": "699222222"},
                          headers=auth_headers(oper_token))
    assert blocked.status_code == 422
    assert "epuise" in blocked.json()["detail"]


def test_sim_movements_full_lifecycle(client, oper_token, seed):
    sim_resp = client.post(f"/api/partners/{seed['p1']}/sim",
                            json={"pos_id": seed["pos1"], "iccid": "8923700000000099003", "numero_msisdn": "699333333"},
                            headers=auth_headers(oper_token))
    sim_id = sim_resp.json()["id"]

    # RECEPTION -> EN_STOCK
    reception = client.post(f"/api/partners/{seed['p1']}/sim/{sim_id}/movements",
                             json={"movement_type": "RECEPTION", "comment": "Approvisionnement"},
                             headers=auth_headers(oper_token))
    assert reception.status_code == 201

    # VENTE -> ASSIGNEE
    vente = client.post(f"/api/partners/{seed['p1']}/sim/{sim_id}/movements",
                         json={"movement_type": "VENTE"}, headers=auth_headers(oper_token))
    assert vente.status_code == 201

    # ACTIVATION -> ACTIVE (necessite d'etre deja assignee)
    activation = client.post(f"/api/partners/{seed['p1']}/sim/{sim_id}/movements",
                              json={"movement_type": "ACTIVATION"}, headers=auth_headers(oper_token))
    assert activation.status_code == 201

    movements = client.get(f"/api/partners/{seed['p1']}/sim/{sim_id}/movements", headers=auth_headers(oper_token))
    assert movements.json()["total"] == 3

    # RETOUR -> RETOURNEE
    retour = client.post(f"/api/partners/{seed['p1']}/sim/{sim_id}/movements",
                          json={"movement_type": "RETOUR"}, headers=auth_headers(oper_token))
    assert retour.status_code == 201


def test_sim_activation_rejected_if_not_assigned(client, oper_token, seed):
    sim_resp = client.post(f"/api/partners/{seed['p1']}/sim",
                            json={"pos_id": seed["pos1"], "iccid": "8923700000000099004", "numero_msisdn": "699444444"},
                            headers=auth_headers(oper_token))
    sim_id = sim_resp.json()["id"]

    activation = client.post(f"/api/partners/{seed['p1']}/sim/{sim_id}/movements",
                              json={"movement_type": "ACTIVATION"}, headers=auth_headers(oper_token))
    assert activation.status_code == 422


def test_sim_status_update_route(client, oper_token, seed):
    sim_resp = client.post(f"/api/partners/{seed['p1']}/sim",
                            json={"pos_id": seed["pos1"], "iccid": "8923700000000099005", "numero_msisdn": "699555555"},
                            headers=auth_headers(oper_token))
    sim_id = sim_resp.json()["id"]

    update = client.patch(f"/api/partners/{seed['p1']}/sim/{sim_id}/status",
                           json={"status": "PERDUE"}, headers=auth_headers(oper_token))
    assert update.status_code == 200
    assert update.json()["status"] == "PERDUE"


def test_sim_phone_number_optional(client, oper_token, seed):
    """Test that phone number is optional and can be null."""
    # Create SIM without phone number
    sim_resp = client.post(f"/api/partners/{seed['p1']}/sim",
                            json={"pos_id": seed["pos1"], "iccid": "8923700000000099006"},
                            headers=auth_headers(oper_token))
    assert sim_resp.status_code == 201
    assert sim_resp.json()["numero_msisdn"] is None

    # Create SIM with phone number
    sim_resp2 = client.post(f"/api/partners/{seed['p1']}/sim",
                             json={"pos_id": seed["pos1"], "iccid": "8923700000000099007", "numero_msisdn": "699666666"},
                             headers=auth_headers(oper_token))
    assert sim_resp2.status_code == 201
    assert sim_resp2.json()["numero_msisdn"] == "699666666"

    # List SIMs and verify phone numbers are returned
    list_resp = client.get(f"/api/partners/{seed['p1']}/sim", headers=auth_headers(oper_token))
    assert list_resp.status_code == 200
    sims = list_resp.json()["items"]
    sim_with_phone = next((s for s in sims if s["iccid"] == "8923700000000099007"), None)
    sim_without_phone = next((s for s in sims if s["iccid"] == "8923700000000099006"), None)
    assert sim_with_phone is not None
    assert sim_with_phone["numero_msisdn"] == "699666666"
    assert sim_without_phone is not None
    assert sim_without_phone["numero_msisdn"] is None

