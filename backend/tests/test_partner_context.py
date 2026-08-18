"""
Verifie l'isolation du PartnerContext (F-02/F-03) : un utilisateur ne
doit jamais pouvoir consulter ou modifier une donnee d'un autre
Partenaire, meme en changeant l'identifiant dans l'URL.
"""
from tests.conftest import auth_headers


def test_access_denied_on_unauthorized_partner(client, rep1_token, seed):
    # rep1 n'a acces qu'au Partenaire p1 : toute route vers p2 doit etre 403
    resp = client.get(f"/api/partners/{seed['p2']}/pos", headers=auth_headers(rep1_token))
    assert resp.status_code == 403


def test_access_granted_on_authorized_partner(client, rep1_token, seed):
    resp = client.get(f"/api/partners/{seed['p1']}/pos", headers=auth_headers(rep1_token))
    assert resp.status_code == 200
    body = resp.json()
    assert "items" in body and "total" in body  # enveloppe de pagination


def test_admin_has_access_to_all_partners(client, admin_token, seed):
    resp1 = client.get(f"/api/partners/{seed['p1']}/pos", headers=auth_headers(admin_token))
    resp2 = client.get(f"/api/partners/{seed['p2']}/pos", headers=auth_headers(admin_token))
    assert resp1.status_code == 200
    assert resp2.status_code == 200


def test_dsm_scoped_to_its_own_partner(client, dsm1_token, seed):
    resp = client.get(f"/api/partners/{seed['p1']}/pos", headers=auth_headers(dsm1_token))
    assert resp.status_code == 200
    resp_other = client.get(f"/api/partners/{seed['p2']}/pos", headers=auth_headers(dsm1_token))
    assert resp_other.status_code == 403


def test_no_token_is_rejected(client, seed):
    resp = client.get(f"/api/partners/{seed['p1']}/pos")
    assert resp.status_code == 401
