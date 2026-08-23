"""
Reconduction SIM : reaffectation formelle d'une carte a un nouveau POS
du meme Partenaire, tracee dans les mouvements et rejettee si la SIM
est deja rattachee au POS cible.
"""
from datetime import date, timedelta

from tests.conftest import auth_headers


def _create_pos_with_stock(client, token, seed, code, stock=3):
    payload = {
        "code_pos": code,
        "name": f"POS {code}",
        "dsm_id": seed["dsm1"],
        "date_creation": str(date.today()),
        "date_expiration": str(date.today() + timedelta(days=200)),
        "stock_initial": stock,
        "stock_actuel": stock,
    }
    resp = client.post(f"/api/partners/{seed['p1']}/pos", json=payload, headers=auth_headers(token))
    assert resp.status_code == 201
    return resp.json()["id"]


def _create_sim(client, token, seed, pos_id, iccid):
    resp = client.post(
        f"/api/partners/{seed['p1']}/sim",
        json={"pos_id": pos_id, "iccid": iccid},
        headers=auth_headers(token),
    )
    assert resp.status_code == 201
    return resp.json()["id"]


def test_sim_reconduction_moves_to_new_pos_and_traces_movement(client, rep1_token, seed):
    src = _create_pos_with_stock(client, rep1_token, seed, "T-POS-SIM-SRC", stock=5)
    dst = _create_pos_with_stock(client, rep1_token, seed, "T-POS-SIM-DST", stock=0)

    sim_id = _create_sim(client, rep1_token, seed, src, "89237000000000000601")

    moved = client.post(
        f"/api/partners/{seed['p1']}/sim/{sim_id}/reconduction",
        json={"new_pos_id": dst, "motif": "Changement de POS"},
        headers=auth_headers(rep1_token),
    )
    assert moved.status_code == 200
    assert moved.json()["pos_id"] == dst

    # Le transfert laisse une trace dans les mouvements de la SIM
    movements = client.get(
        f"/api/partners/{seed['p1']}/sim/{sim_id}/movements",
        headers=auth_headers(rep1_token),
    )
    assert movements.status_code == 200
    types = [item["movement_type"] for item in movements.json()["items"]]
    assert "RECEPTION" in types

    # Reconduire vers le POS courant est refuse (deja rattachee)
    same = client.post(
        f"/api/partners/{seed['p1']}/sim/{sim_id}/reconduction",
        json={"new_pos_id": dst},
        headers=auth_headers(rep1_token),
    )
    assert same.status_code == 422


def test_sim_reconduction_rejects_foreign_new_pos(client, admin_token, rep1_token, seed, client_p2_pos):
    """La reconduction ne peut cibler qu'un POS du meme Partenaire."""
    src = _create_pos_with_stock(client, rep1_token, seed, "T-POS-SIM-FR", stock=2)
    sim_id = _create_sim(client, rep1_token, seed, src, "89237000000000000602")

    resp = client.post(
        f"/api/partners/{seed['p1']}/sim/{sim_id}/reconduction",
        json={"new_pos_id": client_p2_pos},
        headers=auth_headers(admin_token),
    )
    assert resp.status_code == 404