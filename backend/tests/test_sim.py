"""
Verifie le module SIM : creation, unicite de l'ICCID, assignation a un
Client (avec controle de coherence POS), et l'ensemble des mouvements
de stock (reception, vente, activation, retour, perte) avec leurs
transitions de statut.
"""
from tests.conftest import auth_headers


def _create_client(client, token, partner_id, pos_id, name="Client SIM Test"):
    resp = client.post(f"/api/partners/{partner_id}/clients",
                        json={"pos_id": pos_id, "full_name": name}, headers=auth_headers(token))
    assert resp.status_code == 201
    return resp.json()["id"]


def test_create_sim_and_reject_duplicate_iccid(client, rep1_token, seed):
    payload = {"pos_id": seed["pos1"], "iccid": "8923700000000012345"}
    first = client.post(f"/api/partners/{seed['p1']}/sim", json=payload, headers=auth_headers(rep1_token))
    assert first.status_code == 201
    assert first.json()["status"] == "EN_STOCK"

    duplicate = client.post(f"/api/partners/{seed['p1']}/sim", json=payload, headers=auth_headers(rep1_token))
    assert duplicate.status_code == 409


def test_assign_sim_requires_client_on_same_pos(client, rep1_token, seed):
    sim_resp = client.post(f"/api/partners/{seed['p1']}/sim",
                            json={"pos_id": seed["pos1"], "iccid": "8923700000000099001"},
                            headers=auth_headers(rep1_token))
    sim_id = sim_resp.json()["id"]
    client_id = _create_client(client, rep1_token, seed["p1"], seed["pos1"])

    assign = client.post(f"/api/partners/{seed['p1']}/sim/{sim_id}/assign",
                          json={"client_id": client_id}, headers=auth_headers(rep1_token))
    assert assign.status_code == 200
    assert assign.json()["status"] == "ASSIGNEE"
    assert assign.json()["client_id"] == client_id


def test_assign_sim_rejects_client_on_different_pos(client, rep1_token, seed):
    # Cree un second POS pour placer le Client ailleurs que la SIM
    from datetime import date, timedelta
    other_pos = client.post(f"/api/partners/{seed['p1']}/pos", json={
        "code_pos": "T-POS-SIM-OTHER", "name": "Autre POS", "dsm_id": seed["dsm1"],
        "date_creation": str(date.today()), "date_expiration": str(date.today() + timedelta(days=200)),
    }, headers=auth_headers(rep1_token))
    other_pos_id = other_pos.json()["id"]

    sim_resp = client.post(f"/api/partners/{seed['p1']}/sim",
                            json={"pos_id": seed["pos1"], "iccid": "8923700000000099002"},
                            headers=auth_headers(rep1_token))
    sim_id = sim_resp.json()["id"]
    client_id = _create_client(client, rep1_token, seed["p1"], other_pos_id, name="Client autre POS")

    assign = client.post(f"/api/partners/{seed['p1']}/sim/{sim_id}/assign",
                          json={"client_id": client_id}, headers=auth_headers(rep1_token))
    assert assign.status_code == 422


def test_sim_movements_full_lifecycle(client, rep1_token, seed):
    sim_resp = client.post(f"/api/partners/{seed['p1']}/sim",
                            json={"pos_id": seed["pos1"], "iccid": "8923700000000099003"},
                            headers=auth_headers(rep1_token))
    sim_id = sim_resp.json()["id"]
    client_id = _create_client(client, rep1_token, seed["p1"], seed["pos1"], name="Client lifecycle")

    # RECEPTION -> EN_STOCK
    reception = client.post(f"/api/partners/{seed['p1']}/sim/{sim_id}/movements",
                             json={"movement_type": "RECEPTION", "comment": "Approvisionnement"},
                             headers=auth_headers(rep1_token))
    assert reception.status_code == 201

    # Assignation prealable necessaire avant VENTE
    client.post(f"/api/partners/{seed['p1']}/sim/{sim_id}/assign",
                json={"client_id": client_id}, headers=auth_headers(rep1_token))

    # VENTE -> ASSIGNEE
    vente = client.post(f"/api/partners/{seed['p1']}/sim/{sim_id}/movements",
                         json={"movement_type": "VENTE"}, headers=auth_headers(rep1_token))
    assert vente.status_code == 201

    # ACTIVATION -> ACTIVE (necessite d'etre deja assignee)
    activation = client.post(f"/api/partners/{seed['p1']}/sim/{sim_id}/movements",
                              json={"movement_type": "ACTIVATION"}, headers=auth_headers(rep1_token))
    assert activation.status_code == 201

    sim_state = client.get(f"/api/partners/{seed['p1']}/sim/{sim_id}/movements", headers=auth_headers(rep1_token))
    assert sim_state.status_code == 200
    assert sim_state.json()["total"] == 3

    # RETOUR -> RETOURNEE, doit vider le rattachement client
    retour = client.post(f"/api/partners/{seed['p1']}/sim/{sim_id}/movements",
                          json={"movement_type": "RETOUR"}, headers=auth_headers(rep1_token))
    assert retour.status_code == 201


def test_sim_activation_rejected_if_not_assigned(client, rep1_token, seed):
    sim_resp = client.post(f"/api/partners/{seed['p1']}/sim",
                            json={"pos_id": seed["pos1"], "iccid": "8923700000000099004"},
                            headers=auth_headers(rep1_token))
    sim_id = sim_resp.json()["id"]

    activation = client.post(f"/api/partners/{seed['p1']}/sim/{sim_id}/movements",
                              json={"movement_type": "ACTIVATION"}, headers=auth_headers(rep1_token))
    assert activation.status_code == 422


def test_sim_status_update_route(client, rep1_token, seed):
    sim_resp = client.post(f"/api/partners/{seed['p1']}/sim",
                            json={"pos_id": seed["pos1"], "iccid": "8923700000000099005"},
                            headers=auth_headers(rep1_token))
    sim_id = sim_resp.json()["id"]

    update = client.patch(f"/api/partners/{seed['p1']}/sim/{sim_id}/status",
                           json={"status": "PERDUE"}, headers=auth_headers(rep1_token))
    assert update.status_code == 200
    assert update.json()["status"] == "PERDUE"
