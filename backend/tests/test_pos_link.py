"""
Link / unlink Utilisateur <-> POS : designation du detenteur
(holder_user_id + table d'association UserPOS) et isolation
multi-Partenaire des operations de liaison.
"""
from datetime import date, timedelta

from tests.conftest import auth_headers


def _create_pos(client, token, seed, code):
    payload = {
        "code_pos": code,
        "name": f"POS {code}",
        "dsm_id": seed["dsm1"],
        "date_creation": str(date.today()),
        "date_expiration": str(date.today() + timedelta(days=200)),
    }
    resp = client.post(f"/api/partners/{seed['p1']}/pos", json=payload, headers=auth_headers(token))
    assert resp.status_code == 201
    return resp.json()["id"]


def _link(client, seed, token, pos_id, user_id):
    return client.post(
        f"/api/partners/{seed['p1']}/pos/{pos_id}/link",
        json={"user_id": user_id},
        headers=auth_headers(token),
    )


def test_link_sets_holder_and_userpos_association(client, rep1_token, seed):
    pos_id = _create_pos(client, rep1_token, seed, "T-POS-LINK-1")

    resp = _link(client, seed, rep1_token, pos_id, seed["rep1_id"])
    assert resp.status_code == 201
    body = resp.json()
    assert body["holder_user_id"] == seed["rep1_id"]
    assert seed["rep1_id"] in body["linked_users"]

    # Doublon rejete : l'utilisateur est deja detenteur
    again = _link(client, seed, rep1_token, pos_id, seed["rep1_id"])
    assert again.status_code == 409

    # Etat lisible via GET /link
    state = client.get(f"/api/partners/{seed['p1']}/pos/{pos_id}/link", headers=auth_headers(rep1_token))
    assert state.status_code == 200
    assert state.json()["holder_user_id"] == seed["rep1_id"]

    # Reflete dans le POS lui-meme
    pos_resp = client.get(f"/api/partners/{seed['p1']}/pos/{pos_id}", headers=auth_headers(rep1_token))
    assert pos_resp.json()["holder_user_id"] == seed["rep1_id"]


def test_unlink_clears_holder_and_is_repeat_safe(client, rep1_token, seed):
    pos_id = _create_pos(client, rep1_token, seed, "T-POS-UNLINK-1")
    assert _link(client, seed, rep1_token, pos_id, seed["dsm1_user_id"]).status_code == 201

    unlink = client.post(
        f"/api/partners/{seed['p1']}/pos/{pos_id}/unlink",
        json={},
        headers=auth_headers(rep1_token),
    )
    assert unlink.status_code == 200
    body = unlink.json()
    assert body["holder_user_id"] is None
    assert body["linked_users"] == []

    # Un second unlink sans aucun lien est refuse
    again = client.post(
        f"/api/partners/{seed['p1']}/pos/{pos_id}/unlink",
        json={},
        headers=auth_headers(rep1_token),
    )
    assert again.status_code == 409


def test_unknown_user_and_cross_partner_pos_are_rejected(client, admin_token, rep1_token, seed, client_p2_pos):
    pos_id = _create_pos(client, rep1_token, seed, "T-POS-LINK-X")

    # Utilisateur inexistant -> 404
    missing = _link(client, seed, rep1_token, pos_id, 999999)
    assert missing.status_code == 404

    # POS d'un autre Partenaire -> 404 (isolation PartnerContext)
    forged = client.post(
        f"/api/partners/{seed['p1']}/pos/{client_p2_pos}/link",
        json={"user_id": seed["rep1_id"]},
        headers=auth_headers(admin_token),
    )
    assert forged.status_code == 404