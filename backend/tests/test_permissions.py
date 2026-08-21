"""
Verifie les regles de permission des 4 roles applicatifs (section 3.1) :
hierarchie par poids et, surtout, le cas explicite ou un OPERATIONNEL ne
peut JAMAIS acceder aux donnees d'un autre Partenaire, meme en forgeant
le partner_id dans l'URL.
"""
from tests.conftest import auth_headers


def test_operationnel_access_own_partner(client, oper_token, seed):
    resp = client.get(f"/api/partners/{seed['p1']}/pos", headers=auth_headers(oper_token))
    assert resp.status_code == 200


def test_operationnel_cannot_access_other_partner_even_forging(client, oper_token, seed):
    # L'OPERATIONNEL est rattache a p1. Meme en forgeant l'URL vers p2,
    # le PartnerContext lui bloque l'acces (403).
    resp = client.get(f"/api/partners/{seed['p2']}/pos", headers=auth_headers(oper_token))
    assert resp.status_code == 403


def test_operationnel_without_assignment_forbidden(client, admin_token, seed):
    # Un compte OPERATIONNEL sans partenaire rattache ne doit rien pouvoir consulter.
    from app.models.user import User
    from app.security.password import hash_password
    from app.security.permissions import Role
    from app.core.database import SessionLocal

    db = SessionLocal()
    orphan = User(username="t_orphan_op", email="orphan@test.cm", role=Role.OPERATIONNEL,
                  hashed_password=hash_password("Orphan@1234"))
    db.add(orphan)
    db.commit()
    db.refresh(orphan)
    db.close()

    login = client.post("/api/auth/login", json={"username": "t_orphan_op", "password": "Orphan@1234"})
    assert login.status_code == 200
    token = login.json()["access_token"]

    resp = client.get(f"/api/partners/{seed['p1']}/pos", headers=auth_headers(token))
    assert resp.status_code == 403


def test_manager_can_consult_all_partners(client, manager_token, seed):
    resp = client.get(f"/api/partners/{seed['p1']}/pos", headers=auth_headers(manager_token))
    assert resp.status_code == 200


def test_manager_cannot_access_admin_screen(client, manager_token):
    resp = client.get("/api/admin/partners", headers=auth_headers(manager_token))
    assert resp.status_code == 403


def test_chef_operationnel_can_consult(client, chef_token, seed):
    resp = client.get(f"/api/partners/{seed['p1']}/pos", headers=auth_headers(chef_token))
    assert resp.status_code == 200


def test_admin_can_access_admin_screen(client, admin_token):
    resp = client.get("/api/admin/partners", headers=auth_headers(admin_token))
    assert resp.status_code == 200
