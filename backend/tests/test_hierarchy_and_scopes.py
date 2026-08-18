import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from main import app
from app.models.user import User
from app.models.enums import RoleUser
from app.models.partenaire import Partenaire, TypePartenaire, StatutPartenaire
from app.models.dsm import DSM, StatutDSM
from app.models.pos import POS, StatutPOS, TypePOS
from app.models.bts import BTS, StatutBTS, Operateur
from app.security.jwt import create_access_token
from app.security.password import hash_password
from app.services.access_scope import get_access_scope
from datetime import date

from sqlalchemy.pool import StaticPool

# In-memory SQLite for tests
TEST_DB_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="module")
def setup_db():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()

    # Create 2 Partenaires
    p1 = Partenaire(code_partenaire="P1", nom="Partenaire 1", type_partenaire=TypePartenaire.DISTRIBUTEUR, statut=StatutPartenaire.ACTIF)
    p2 = Partenaire(code_partenaire="P2", nom="Partenaire 2", type_partenaire=TypePartenaire.DISTRIBUTEUR, statut=StatutPartenaire.ACTIF)
    db.add_all([p1, p2])
    db.flush()

    # Create 2 DSMs
    dsm1 = DSM(matricule="DSM1", nom_complet="DSM Alpha", zone_couverture="Zone A", statut=StatutDSM.ACTIF)
    dsm2 = DSM(matricule="DSM2", nom_complet="DSM Beta", zone_couverture="Zone B", statut=StatutDSM.ACTIF)
    db.add_all([dsm1, dsm2])
    db.flush()

    # Create POS
    pos1 = POS(code_pos="POS1", nom="POS P1-D1", partenaire_id=p1.id, dsm_id=dsm1.id, date_creation=date.today(), statut=StatutPOS.ACTIF, type_pos=TypePOS.NOUVEAU)
    pos2 = POS(code_pos="POS2", nom="POS P2-D2", partenaire_id=p2.id, dsm_id=dsm2.id, date_creation=date.today(), statut=StatutPOS.ACTIF, type_pos=TypePOS.NOUVEAU)
    db.add_all([pos1, pos2])
    db.flush()

    # Create BTS for P1
    bts1 = BTS(code_bts="BTS1", nom="Antenne 1", partenaire_id=p1.id, operateur=Operateur.CAMTEL, capacite_max=500.0, statut=StatutBTS.ACTIF)
    db.add(bts1)
    db.flush()

    # Create 4 Users representing the 4 roles
    u_admin = User(email="admin@test.local", password_hash=hash_password("test"), nom_complet="Admin", role=RoleUser.ADMIN, actif=True)
    u_manager = User(email="manager@test.local", password_hash=hash_password("test"), nom_complet="Manager P1", role=RoleUser.MANAGER, partenaire_id=p1.id, actif=True)
    u_dsm = User(email="dsm@test.local", password_hash=hash_password("test"), nom_complet="DSM User", role=RoleUser.DSM, actif=True)
    u_viewer = User(email="viewer@test.local", password_hash=hash_password("test"), nom_complet="Viewer POS1", role=RoleUser.VIEWER, pos_id=pos1.id, actif=True)
    db.add_all([u_admin, u_manager, u_dsm, u_viewer])
    db.flush()

    dsm1.user_id = u_dsm.id
    db.commit()

    yield {
        "db": db,
        "p1": p1,
        "p2": p2,
        "dsm1": dsm1,
        "dsm2": dsm2,
        "pos1": pos1,
        "pos2": pos2,
        "bts1": bts1,
        "u_admin": u_admin,
        "u_manager": u_manager,
        "u_dsm": u_dsm,
        "u_viewer": u_viewer,
    }
    db.close()



@pytest.fixture
def client(setup_db):
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_access_scope_computation(setup_db):
    db = setup_db["db"]
    # 1. Admin
    scope_admin = get_access_scope(db, setup_db["u_admin"])
    assert scope_admin.is_admin is True
    assert scope_admin.partenaire_ids is None
    assert scope_admin.pos_ids is None

    # 2. Manager
    scope_manager = get_access_scope(db, setup_db["u_manager"])
    assert scope_manager.partenaire_ids == [setup_db["p1"].id]
    assert setup_db["pos1"].id in scope_manager.pos_ids
    assert setup_db["pos2"].id not in scope_manager.pos_ids

    # 3. DSM
    scope_dsm = get_access_scope(db, setup_db["u_dsm"])
    assert scope_dsm.dsm_ids == [setup_db["dsm1"].id]
    assert setup_db["pos1"].id in scope_dsm.pos_ids
    assert setup_db["pos2"].id not in scope_dsm.pos_ids
    assert scope_dsm.bts_ids == []

    # 4. Viewer
    scope_viewer = get_access_scope(db, setup_db["u_viewer"])
    assert scope_viewer.pos_ids == [setup_db["pos1"].id]
    assert scope_viewer.dsm_ids == [setup_db["dsm1"].id]
    assert scope_viewer.partenaire_ids == [setup_db["p1"].id]
    assert scope_viewer.bts_ids == []


def test_hierarchy_endpoint_admin(client, setup_db):
    token = create_access_token(setup_db["u_admin"].id, setup_db["u_admin"].email, RoleUser.ADMIN.value)
    resp = client.get("/api/hierarchy", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2  # Sees both P1 and P2


def test_hierarchy_endpoint_manager(client, setup_db):
    token = create_access_token(setup_db["u_manager"].id, setup_db["u_manager"].email, RoleUser.MANAGER.value)
    resp = client.get("/api/hierarchy", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["id"] == setup_db["p1"].id
    # Check BTS
    assert len(data[0]["bts"]) == 1
    # Check DSM and POS
    assert len(data[0]["dsms"]) == 1
    assert data[0]["dsms"][0]["pos"][0]["id"] == setup_db["pos1"].id


def test_hierarchy_endpoint_dsm(client, setup_db):
    token = create_access_token(setup_db["u_dsm"].id, setup_db["u_dsm"].email, RoleUser.DSM.value)
    resp = client.get("/api/hierarchy", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["id"] == setup_db["p1"].id
    assert len(data[0]["bts"]) == 0  # DSM cannot see BTS
    assert len(data[0]["dsms"]) == 1
    assert data[0]["dsms"][0]["id"] == setup_db["dsm1"].id


def test_hierarchy_endpoint_viewer(client, setup_db):
    token = create_access_token(setup_db["u_viewer"].id, setup_db["u_viewer"].email, RoleUser.VIEWER.value)
    resp = client.get("/api/hierarchy", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert len(data[0]["bts"]) == 0
    assert len(data[0]["dsms"][0]["pos"]) == 1
    assert data[0]["dsms"][0]["pos"][0]["id"] == setup_db["pos1"].id
