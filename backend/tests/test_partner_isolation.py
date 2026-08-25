"""Isolation du contexte partenaire (etape 3).

Scénario minimal demande :
  Partenaire A : 10 POS, 3 DSM, 5 BTS
  Partenaire B : 20 POS, 4 DSM, 8 BTS

Lorsque le contexte Partenaire A est sélectionne (GET /api/partners/{A}/...),
aucune donnee du Partenaire B ne doit apparaitre dans les reponses.

L'utilisateur utilise ici un ADMIN (acces global) : le test verifie donc le
FILTRAGE SQL par partner_id des endpoints, et pas seulement la regle de
permission (403) deja couverte par test_partner_context.py / test_permissions.py.
"""
from datetime import date, timedelta

from tests.conftest import auth_headers

from app.core.database import SessionLocal
from app.models.partner import Partner
from app.models.dsm import DSM
from app.models.pos import POS
from app.models.bts import BTS


def _clear_isolation(db) -> None:
    """Supprime les partenaires ISO d'un test precedent (base partagee)."""
    partners = db.query(Partner).filter(Partner.code.in_(["ISO-A", "ISO-B"])).all()
    pid = [p.id for p in partners]
    if not pid:
        return
    db.query(POS).filter(POS.partner_id.in_(pid)).delete(synchronize_session=False)
    db.query(BTS).filter(BTS.partner_id.in_(pid)).delete(synchronize_session=False)
    db.query(DSM).filter(DSM.partner_id.in_(pid)).delete(synchronize_session=False)
    for p in partners:
        db.delete(p)
    db.commit()


def _build_isolation_dataset():
    """Cree deux partenaires ISO-A / ISO-B avec leurs donnees. Retourne {idA, idB}."""
    db = SessionLocal()
    try:
        _clear_isolation(db)

        pa = Partner(code="ISO-A", name="Partenaire A", is_active=True)
        pb = Partner(code="ISO-B", name="Partenaire B", is_active=True)
        db.add_all([pa, pb])
        db.commit()
        db.refresh(pa)
        db.refresh(pb)

        dsma = [DSM(matricule=f"DSM-A-{i}", full_name=f"DSM A {i}", partner_id=pa.id) for i in range(3)]
        dsmb = [DSM(matricule=f"DSM-B-{i}", full_name=f"DSM B {i}", partner_id=pb.id) for i in range(4)]
        db.add_all(dsma + dsmb)
        db.commit()
        for d in dsma + dsmb:
            db.refresh(d)

        today = date.today()
        pos_a = [
            POS(code_pos=f"POS-A-{i:03d}", name=f"POS A {i}",
                partner_id=pa.id, dsm_id=dsma[i % len(dsma)].id,
                date_creation=today, date_expiration=today + timedelta(days=365))
            for i in range(10)
        ]
        pos_b = [
            POS(code_pos=f"POS-B-{i:03d}", name=f"POS B {i}",
                partner_id=pb.id, dsm_id=dsmb[i % len(dsmb)].id,
                date_creation=today, date_expiration=today + timedelta(days=365))
            for i in range(20)
        ]
        db.add_all(pos_a + pos_b)
        db.commit()

        bts_a = [
            BTS(partner_id=pa.id, code_bts=f"BTS-A-{i}", operateur="CAMTEL", technologie="4G")
            for i in range(5)
        ]
        bts_b = [
            BTS(partner_id=pb.id, code_bts=f"BTS-B-{i}", operateur="CAMTEL", technologie="4G")
            for i in range(8)
        ]
        db.add_all(bts_a + bts_b)
        db.commit()
        return {"a": pa.id, "b": pb.id}
    finally:
        db.close()


def test_partner_a_isolation_pos(client, admin_token):
    ids = _build_isolation_dataset()
    h = auth_headers(admin_token)
    resp = client.get(f"/api/partners/{ids['a']}/pos", headers=h)
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 10
    codes = [p["code_pos"] for p in body["items"]]
    assert all(c.startswith("POS-A-") for c in codes)
    assert not any(c.startswith("POS-B-") for c in codes)


def test_partner_a_isolation_dsm(client, admin_token):
    ids = _build_isolation_dataset()
    h = auth_headers(admin_token)
    resp = client.get(f"/api/partners/{ids['a']}/dsm", headers=h)
    assert resp.status_code == 200
    body = resp.json()
    assert len(body) == 3
    mat = [d["matricule"] for d in body]
    assert all(m.startswith("DSM-A-") for m in mat)
    assert not any(m.startswith("DSM-B-") for m in mat)


def test_partner_a_isolation_bts(client, admin_token):
    ids = _build_isolation_dataset()
    h = auth_headers(admin_token)
    resp = client.get(f"/api/partners/{ids['a']}/bts", headers=h)
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 5
    codes = [b["code_bts"] for b in body["items"]]
    assert all(c.startswith("BTS-A-") for c in codes)
    assert not any(c.startswith("BTS-B-") for c in codes)


def test_partner_b_has_its_own_data(client, admin_token):
    ids = _build_isolation_dataset()
    h = auth_headers(admin_token)
    resp = client.get(f"/api/partners/{ids['b']}/pos", headers=h)
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 20
    assert all(p["code_pos"].startswith("POS-B-") for p in body["items"])