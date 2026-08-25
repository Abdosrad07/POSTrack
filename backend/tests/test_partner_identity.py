"""Tests de la carte d'identité partenaire (étape 5).

Scénario :
- Partenaire "complet" (identité déclarative + micro-zones + POS actif/suspendu + BTS)
- Partenaire "vide" (aucune info -> champs None, compteurs 0)
- Isolation : un OPERATIONNEL ne lit que son propre partenaire.
"""
from datetime import date, timedelta

import pytest

from app.core.database import SessionLocal
from app.models.bts import BTS
from app.models.dsm import DSM
from app.models.partner import MicroZone, Partner
from app.models.pos import POS, StatutPos, TypePos
from app.models.user import User
from app.security.password import hash_password
from app.security.permissions import Role

from tests.conftest import TEST_PASSWORD, auth_headers


@pytest.fixture(scope="module")
def identity_seed(client, seed):
    """Partenaire complet dédié (compteurs déterministes) + partenaire vide."""
    db = SessionLocal()

    resp_user = User(username="t_resp", email="t_resp@test.cm",
                     role=Role.CHEF_OPERATIONNEL, hashed_password=hash_password(TEST_PASSWORD))
    comm_user = User(username="t_comm", email="t_comm@test.cm",
                     role=Role.MANAGER, hashed_password=hash_password(TEST_PASSWORD))
    db.add_all([resp_user, comm_user])
    db.commit()
    db.refresh(resp_user)
    db.refresh(comm_user)

    full = Partner(code="T-IDP", name="Partenaire Identite Complet", address="Douala")
    empty = Partner(code="T-IDE", name="Partenaire Identite Vide")
    db.add_all([full, empty])
    db.commit()
    db.refresh(full)
    db.refresh(empty)

    full.responsable_name = "Alice Responsable"
    full.responsable_contact = "+237600000001"
    full.responsable_user_id = resp_user.id
    full.commercial_name = "Bob Commercial"
    full.commercial_contact = "+237600000002"
    full.commercial_user_id = comm_user.id
    full.master_sim_number = "8923700000000000099"
    full.contract_start_date = date(2025, 7, 1)
    db.add_all([
        MicroZone(partner_id=full.id, name="MZ-A"),
        MicroZone(partner_id=full.id, name="MZ-B"),
    ])
    db.commit()

    dsm_full = DSM(matricule="T-IDP-DSM", full_name="DSM Identite", partner_id=full.id)
    db.add(dsm_full)
    db.commit()
    db.refresh(dsm_full)

    today = date.today()
    db.add_all([
        POS(code_pos="T-IDP-POS-1", name="POS Id Actif", partner_id=full.id,
            dsm_id=dsm_full.id, type_pos=TypePos.NOUVEAU, status=StatutPos.ACTIF,
            date_creation=today, date_expiration=today + timedelta(days=300),
            stock_initial=0, stock_actuel=0),
        POS(code_pos="T-IDP-POS-2", name="POS Id Suspendu", partner_id=full.id,
            dsm_id=dsm_full.id, type_pos=TypePos.RECONDUIT, status=StatutPos.SUSPENDU,
            date_creation=today, date_expiration=today + timedelta(days=300),
            stock_initial=0, stock_actuel=0),
    ])
    db.add(BTS(partner_id=full.id, code_bts="T-IDP-BTS-1", operateur="CAMTEL"))
    db.commit()

    data = {"full": full.id, "empty": empty.id, "p1": seed["p1"], "p2": seed["p2"]}
    db.close()
    return data


def test_identity_complete_partner(client, admin_token, identity_seed):
    """Le partenaire complet expose identité déclarative + compteurs exacts."""
    resp = client.get(f"/api/partenaires/{identity_seed['full']}/identity",
                      headers=auth_headers(admin_token))
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["code"] == "T-IDP"
    assert data["name"] == "Partenaire Identite Complet"
    assert data["address"] == "Douala"
    assert data["is_active"] is True
    assert data["contract_start_date"] == "2025-07-01"

    # Responsable / commercial (ID utilisateur résolu en username côté backend)
    assert data["responsable_name"] == "Alice Responsable"
    assert data["responsable_contact"] == "+237600000001"
    assert data["responsable_user_id"] > 0
    assert data["responsable_username"] == "t_resp"
    assert data["commercial_name"] == "Bob Commercial"
    assert data["commercial_contact"] == "+237600000002"
    assert data["commercial_username"] == "t_comm"

    assert data["master_sim_number"] == "8923700000000000099"

    # Compteurs calculés backend (2 micro-zones ; 2 POS dont 1 actif ; 1 BTS)
    assert data["nb_micro_zones"] == 2
    assert data["nb_pos_crees"] == 2
    assert data["nb_pos_actifs"] == 1
    assert data["nb_bts"] == 1


def test_identity_empty_partner_shows_no_invented_data(client, admin_token, identity_seed):
    """Un partenaire sans données renvoie None/0 — le frontend affichera « Non renseigné »."""
    resp = client.get(f"/api/partenaires/{identity_seed['empty']}/identity",
                      headers=auth_headers(admin_token))
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["code"] == "T-IDE"
    assert data["name"] == "Partenaire Identite Vide"
    for field in ("address", "responsable_name", "responsable_contact",
                  "responsable_user_id", "responsable_username",
                  "commercial_name", "commercial_contact",
                  "commercial_user_id", "commercial_username",
                  "master_sim_number", "contract_start_date"):
        assert data[field] is None, f"{field} devrait être None (non inventé)"
    for field in ("nb_micro_zones", "nb_pos_crees", "nb_pos_actifs", "nb_bts"):
        assert data[field] == 0, f"{field} devrait être 0"


def test_identity_unknown_partner_404(client, admin_token, identity_seed):
    resp = client.get("/api/partenaires/999999/identity", headers=auth_headers(admin_token))
    assert resp.status_code == 404


def test_identity_operationnel_isolated_to_own_partner(client, oper_token, identity_seed):
    """L'OPERATIONNEL lit son partenaire (p1) mais pas celui des autres."""
    ok = client.get(f"/api/partenaires/{identity_seed['p1']}/identity",
                    headers=auth_headers(oper_token))
    assert ok.status_code == 200, ok.text

    forbidden = client.get(f"/api/partenaires/{identity_seed['full']}/identity",
                           headers=auth_headers(oper_token))
    assert forbidden.status_code == 403