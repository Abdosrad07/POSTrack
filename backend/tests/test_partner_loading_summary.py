from datetime import date, timedelta

def test_loading_summary_is_partner_scoped(client, admin_token, seed):
    resp = client.get(f"/api/partners/{seed['p1']}/analytics/loading-summary", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    body = resp.json()
    assert body['partner_id'] == seed['p1']
    assert 'loading' in body
    assert isinstance(body['by_dsm'], list)


def test_loading_summary_supports_period_filter(client, admin_token, seed):
    params = {'period_start': date.today().isoformat(), 'period_end': (date.today() + timedelta(days=30)).isoformat()}
    resp = client.get(f"/api/partners/{seed['p1']}/analytics/loading-summary", params=params, headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    body = resp.json()
    assert body['period_start'] == params['period_start']
    assert body['period_end'] == params['period_end']