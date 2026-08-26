from datetime import date

from tests.conftest import auth_headers


def test_sales_targets_upsert_and_summary_use_persisted_objectives(client, admin_token, seed):
    payload = {
        "month": str(date.today().replace(day=1)),
        "creation_target": 20,
        "redeployment_target": 7,
        "sell_out_target": 30,
        "loading_target": 50,
        "revenue_target": 10000000,
        "creation_stock_initial": 10,
        "redeployment_stock_initial": 5,
    }
    upsert = client.post(f"/api/partners/{seed['p1']}/analytics/sales-targets", json=payload, headers=auth_headers(admin_token))
    assert upsert.status_code == 201, upsert.text
    assert upsert.json()["creation_target"] == 20
    assert upsert.json()["revenue_target"] == 10000000

    summary = client.get(f"/api/partners/{seed['p1']}/analytics/sales-summary", headers=auth_headers(admin_token))
    assert summary.status_code == 200, summary.text
    body = summary.json()
    assert body["creation"]["objectif"] == 20
    assert body["redeploiement"]["objectif"] == 7
    assert body["sell_out"]["objectif"] == 30
    assert body["loading"]["objectif"] == 50
    assert body["revenue_global"]["objectif"] == 10000000
    assert body["creation"]["progression"] is not None


def test_sales_targets_are_partner_scoped(client, admin_token, seed):
    payload = {"month": str(date.today().replace(day=1)), "creation_target": 11, "revenue_target": 5000000}
    client.post(f"/api/partners/{seed['p1']}/analytics/sales-targets", json=payload, headers=auth_headers(admin_token))
    res = client.get(f"/api/partners/{seed['p2']}/analytics/sales-summary", headers=auth_headers(admin_token))
    assert res.status_code == 200
    assert res.json()["creation"]["objectif"] is None
    assert res.json()["revenue_global"]["objectif"] is None