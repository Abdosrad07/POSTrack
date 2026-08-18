"""
Verifie la transition POS Nouveau -> Reconduit et son irreversibilite,
ainsi que l'unicite du code_pos dans le Partenaire (regles 1.6.1 et
1.6.2 du cahier des charges).
"""
from datetime import date, timedelta

from tests.conftest import auth_headers


def test_create_pos_is_nouveau_by_default(client, rep1_token, seed):
    payload = {
        "code_pos": "T-POS-NEW-1",
        "name": "Nouveau POS",
        "dsm_id": seed["dsm1"],
        "date_creation": str(date.today()),
        "date_expiration": str(date.today() + timedelta(days=200)),
    }
    resp = client.post(f"/api/partners/{seed['p1']}/pos", json=payload, headers=auth_headers(rep1_token))
    assert resp.status_code == 201
    body = resp.json()
    assert body["type_pos"] == "NOUVEAU"


def test_duplicate_code_pos_is_rejected(client, rep1_token, seed):
    payload = {
        "code_pos": "T-POS-1",  # deja utilise par le seed
        "name": "Doublon",
        "dsm_id": seed["dsm1"],
        "date_creation": str(date.today()),
        "date_expiration": str(date.today() + timedelta(days=200)),
    }
    resp = client.post(f"/api/partners/{seed['p1']}/pos", json=payload, headers=auth_headers(rep1_token))
    assert resp.status_code == 409


def test_reconduction_switches_to_reconduit_and_is_irreversible(client, rep1_token, seed):
    # Cree son propre POS (plutot que le pos1 partage par la session,
    # utilise intact par test_primes.py) pour eviter toute dependance
    # a l'ordre d'execution des tests.
    create_payload = {
        "code_pos": "T-POS-RECOND-1",
        "name": "POS pour test reconduction",
        "dsm_id": seed["dsm1"],
        "date_creation": str(date.today()),
        "date_expiration": str(date.today() + timedelta(days=200)),
    }
    created = client.post(f"/api/partners/{seed['p1']}/pos", json=create_payload, headers=auth_headers(rep1_token))
    assert created.status_code == 201
    pos_id = created.json()["id"]

    resp = client.post(
        f"/api/partners/{seed['p1']}/pos/{pos_id}/reconduction",
        json={"new_expiration": str(date.today() + timedelta(days=500)), "motif": "Test reconduction"},
        headers=auth_headers(rep1_token),
    )
    assert resp.status_code == 201

    pos_resp = client.get(f"/api/partners/{seed['p1']}/pos/{pos_id}", headers=auth_headers(rep1_token))
    assert pos_resp.json()["type_pos"] == "RECONDUIT"

    # Une seconde reconduction du meme POS doit etre rejetee (irreversible)
    resp2 = client.post(
        f"/api/partners/{seed['p1']}/pos/{pos_id}/reconduction",
        json={"new_expiration": str(date.today() + timedelta(days=700)), "motif": "Deuxieme tentative"},
        headers=auth_headers(rep1_token),
    )
    assert resp2.status_code == 409


def test_reconduction_history_is_listed(client, rep1_token, admin_token, seed):
    """L'historique des reconductions d'un POS est expose (GET /pos/{id}/reconductions)."""
    create_payload = {
        "code_pos": "T-POS-HIST-1",
        "name": "POS pour historique",
        "dsm_id": seed["dsm1"],
        "date_creation": str(date.today()),
        "date_expiration": str(date.today() + timedelta(days=200)),
    }
    created = client.post(f"/api/partners/{seed['p1']}/pos", json=create_payload, headers=auth_headers(rep1_token))
    assert created.status_code == 201
    pos_id = created.json()["id"]

    # Avant reconduction : historique vide
    empty = client.get(f"/api/partners/{seed['p1']}/pos/{pos_id}/reconductions", headers=auth_headers(rep1_token))
    assert empty.status_code == 200
    assert empty.json()["total"] == 0

    recon = client.post(
        f"/api/partners/{seed['p1']}/pos/{pos_id}/reconduction",
        json={"new_expiration": str(date.today() + timedelta(days=500)), "motif": "Motif historique"},
        headers=auth_headers(rep1_token),
    )
    assert recon.status_code == 201

    history = client.get(f"/api/partners/{seed['p1']}/pos/{pos_id}/reconductions", headers=auth_headers(rep1_token))
    assert history.status_code == 200
    body = history.json()
    assert body["total"] == 1
    assert len(body["items"]) == 1
    item = body["items"][0]
    assert item["pos_id"] == pos_id
    assert item["motif"] == "Motif historique"
    assert item["old_expiration"] < item["new_expiration"]
    assert item["author_id"] is not None

    # Isolation multi-Partenaire : un POS d'un autre Partenaire est 404
    other = client.get(f"/api/partners/{seed['p2']}/pos/{pos_id}/reconductions", headers=auth_headers(admin_token))
    assert other.status_code == 404
