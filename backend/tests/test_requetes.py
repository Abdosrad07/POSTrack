"""
Verifie le rattachement multi-entites d'une Requete : toutes les
entites referencees doivent appartenir au PartnerContext courant
(section 6.4 du cahier des charges).
"""
from tests.conftest import auth_headers


def test_requete_with_entity_in_context_is_accepted(client, rep1_token, seed):
    payload = {
        "type_requete": "SUPPORT_POS",
        "titre": "Probleme de connexion au POS",
        "description": "Le POS ne parvient plus a se synchroniser.",
        "priorite": "HAUTE",
        "entites": [{"entity_type": "POS", "entity_id": seed["pos1"]}],
    }
    resp = client.post(f"/api/partners/{seed['p1']}/requests", json=payload, headers=auth_headers(rep1_token))
    assert resp.status_code == 201
    body = resp.json()
    assert body["statut"] == "OUVERTE"
    assert body["entites"][0]["entity_id"] == seed["pos1"]


def test_requete_with_entity_out_of_context_is_rejected(client, rep1_token, admin_token, seed, client_p2_pos):
    # client_p2_pos est un POS cree dans le Partenaire p2 : le rattacher
    # a une Requete du Partenaire p1 doit etre refuse.
    payload = {
        "type_requete": "SUPPORT_POS",
        "titre": "Requete invalide multi-entites",
        "entites": [{"entity_type": "POS", "entity_id": client_p2_pos}],
    }
    resp = client.post(f"/api/partners/{seed['p1']}/requests", json=payload, headers=auth_headers(rep1_token))
    assert resp.status_code == 422


def test_requete_status_transition_is_tracked(client, rep1_token, seed):
    create = client.post(
        f"/api/partners/{seed['p1']}/requests",
        json={"type_requete": "AUTRE", "titre": "Suivi de statut"},
        headers=auth_headers(rep1_token),
    )
    requete_id = create.json()["id"]

    update = client.patch(
        f"/api/partners/{seed['p1']}/requests/{requete_id}",
        json={"statut": "EN_COURS", "commentaire": "Prise en charge"},
        headers=auth_headers(rep1_token),
    )
    assert update.status_code == 200
    assert update.json()["statut"] == "EN_COURS"

    close = client.patch(
        f"/api/partners/{seed['p1']}/requests/{requete_id}",
        json={"statut": "FERMEE", "commentaire": "Resolu"},
        headers=auth_headers(rep1_token),
    )
    assert close.status_code == 200
    assert close.json()["closed_at"] is not None
