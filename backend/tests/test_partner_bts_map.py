from app.models.bts import BTS
from app.models.bts_releve import BTSReleve


def _seed_bts(db, partner_id, code, lat, lng, zone):
    bts = BTS(partner_id=partner_id, code_bts=code, latitude=lat, longitude=lng, zone=zone, operateur='CAMTEL')
    db.add(bts)
    db.commit()
    db.refresh(bts)
    db.add(BTSReleve(bts_id=bts.id, taux_saturation=42.0, statut='actif'))
    db.commit()
    return bts


def test_partner_bts_list_is_scoped_to_selected_partner(client, admin_token, seed):
    from app.core.database import SessionLocal
    db = SessionLocal()
    _seed_bts(db, seed['p1'], 'P1-BTS-1', 4.0511, 9.7679, 'Douala 1er')
    _seed_bts(db, seed['p1'], 'P1-BTS-2', 4.0611, 9.7779, 'Bonanjo')
    _seed_bts(db, seed['p2'], 'P2-BTS-1', 4.1511, 9.8679, 'Yaounde Centre')
    db.close()

    response = client.get(f"/api/partners/{seed['p1']}/bts", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    payload = response.json()
    items = payload["items"] if isinstance(payload, dict) else payload
    codes = {item["code_bts"] for item in items}
    assert 'P1-BTS-1' in codes
    assert 'P1-BTS-2' in codes
    assert 'P2-BTS-1' not in codes


def test_partner_bts_detail_is_scoped_to_selected_partner(client, admin_token, seed):
    from app.core.database import SessionLocal
    db = SessionLocal()
    p1_bts = _seed_bts(db, seed['p1'], 'P1-BTS-3', 4.0711, 9.7879, 'Akwa')
    p2_bts = _seed_bts(db, seed['p2'], 'P2-BTS-2', 4.1711, 9.8879, 'Bastos')
    p1_bts_id = p1_bts.id
    p2_bts_id = p2_bts.id
    db.close()

    ok = client.get(f"/api/partners/{seed['p1']}/bts/{p1_bts_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert ok.status_code == 200
    assert ok.json()["code_bts"] == 'P1-BTS-3'

    forbidden = client.get(f"/api/partners/{seed['p1']}/bts/{p2_bts_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert forbidden.status_code == 404