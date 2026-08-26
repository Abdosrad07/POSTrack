from tests.conftest import auth_headers


def test_sales_summary_is_scoped_to_partner(client, admin_token, seed):
    res = client.get(f"/api/partners/{seed['p1']}/analytics/sales-summary", headers=auth_headers(admin_token))
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["partner_id"] == seed["p1"]
    assert "creation" in body
    assert "redeploiement" in body
    assert "sell_out" in body
    assert "loading" in body


def test_sales_summary_does_not_mix_partner_data(client, admin_token, seed):
    res1 = client.get(f"/api/partners/{seed['p1']}/analytics/sales-summary", headers=auth_headers(admin_token))
    res2 = client.get(f"/api/partners/{seed['p2']}/analytics/sales-summary", headers=auth_headers(admin_token))
    assert res1.status_code == 200
    assert res2.status_code == 200
    assert res1.json()["partner_id"] == seed["p1"]
    assert res2.json()["partner_id"] == seed["p2"]