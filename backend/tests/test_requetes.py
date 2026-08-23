"""
Verifie le rattachement multi-entites d'une Requete : toutes les
entites referencees doivent appartenir au PartnerContext courant
(section 6.4 du cahier des charges).
"""
from tests.conftest import auth_headers


def test_requete_with_entity_in_context_is_accepted(client, oper_token, seed):
    payload = {
        "type_requete": "AJOUT",
        "titre": "Ajout de POS",
        "description": "Demande d'ajout d'un POS.",
        "priorite": "HAUTE",
        "nombre_demande": 1,
        "entites": [{"entity_type": "POS", "entity_id": seed["pos1"]}],
    }
    resp = client.post(f"/api/partners/{seed['p1']}/requests", json=payload, headers=auth_headers(oper_token))
    assert resp.status_code == 201
    body = resp.json()
    assert body["nombre_demande"] == 1
    assert body["entites"][0]["entity_id"] == seed["pos1"]


def test_requete_with_entity_out_of_context_is_rejected(client, oper_token, seed, client_p2_pos):
    # client_p2_pos est un POS cree dans le Partenaire p2 : le rattacher
    # a une Requete du Partenaire p1 doit etre refuse.
    payload = {
        "type_requete": "AJOUT",
        "titre": "Requete invalide multi-entites",
        "entites": [{"entity_type": "POS", "entity_id": client_p2_pos}],
    }
    resp = client.post(f"/api/partners/{seed['p1']}/requests", json=payload, headers=auth_headers(oper_token))
    assert resp.status_code == 422


def test_requete_counters_update_and_finalization(client, oper_token, seed):
    create = client.post(
        f"/api/partners/{seed['p1']}/requests",
        json={"type_requete": "RECONDUCTION", "titre": "Reconduction POS", "nombre_demande": 3},
        headers=auth_headers(oper_token),
    )
    assert create.status_code == 201
    requete_id = create.json()["id"]
    assert create.json()["date_finalisation"] is None

    # Traitement partiel : reste ouvert
    update = client.patch(
        f"/api/partners/{seed['p1']}/requests/{requete_id}",
        json={"nombre_effectue": 1, "commentaire": "1 traitee"},
        headers=auth_headers(oper_token),
    )
    assert update.status_code == 200
    assert update.json()["date_finalisation"] is None

    # Traitement complet : finalisation derivee des compteurs
    complete = client.patch(
        f"/api/partners/{seed['p1']}/requests/{requete_id}",
        json={"nombre_effectue": 2, "nombre_rejete": 1},
        headers=auth_headers(oper_token),
    )
    assert complete.status_code == 200
    assert complete.json()["date_finalisation"] is not None


def test_requete_summary_endpoint_groups_and_filters(client, admin_token, seed):
    # Partenaire dedie : le resume ne doit pas etre pollue par les requetes
    # creees par les autres tests sur le partenaire partage p1 (la date de
    # creation est posee serveur a "maintenant", donc tout se retrouve dans
    # le meme groupe du jour).
    created = client.post(
        "/api/admin/partners",
        json={"code": "T-P-SUM", "name": "Partenaire Summary"},
        headers=auth_headers(admin_token),
    )
    assert created.status_code == 201
    pid = created.json()["id"]

    def _add(type_requete, titre, demande, effectue, rejete):
        resp = client.post(
            f"/api/partners/{pid}/requests",
            json={"type_requete": type_requete, "titre": titre, "nombre_demande": demande,
                  "nombre_effectue": effectue, "nombre_rejete": rejete},
            headers=auth_headers(admin_token),
        )
        assert resp.status_code == 201

    _add("AJOUT", "Ajout 1", 2, 1, 1)
    _add("AJOUT", "Ajout 2", 3, 2, 1)
    _add("RECONDUCTION", "Reconduction", 1, 1, 0)

    summary = client.get(f"/api/partners/{pid}/requests/summary", headers=auth_headers(admin_token))
    assert summary.status_code == 200
    body = summary.json()
    assert body["total"] == 2
    # A date de creation egale, le tri descendant sur (date, type) place
    # "Reconduction" avant "Ajout".
    assert body["items"][0]["type_requete"] == "Reconduction"
    assert body["items"][0]["nombre_demande"] == 1
    assert body["items"][1]["type_requete"] == "Ajout"
    assert body["items"][1]["nombre_demande"] == 5
    assert body["items"][1]["nombre_rejete"] == 2
    assert body["items"][1]["nombre_effectue"] == 3

    filtered = client.get(
        f"/api/partners/{pid}/requests/summary",
        params={"type_requete": "AJOUT"},
        headers=auth_headers(admin_token),
    )
    assert filtered.status_code == 200
    filtered_body = filtered.json()
    assert filtered_body["total"] == 1
    assert filtered_body["items"][0]["type_requete"] == "Ajout"
    assert filtered_body["items"][0]["nombre_demande"] == 5

