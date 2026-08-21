"""
Verifie le canal d'import Excel central : rejet d'un fichier avec
colonne manquante, rejet d'une ligne referencant une relation hors
contexte, puis application transactionnelle reelle d'un lot valide.
"""
import io
import pandas as pd

from tests.conftest import auth_headers


def _to_xlsx_bytes(df: pd.DataFrame) -> bytes:
    buf = io.BytesIO()
    df.to_csv(buf, index=False)
    return buf.getvalue()


def test_import_rejects_missing_required_column(client, rep1_token, seed):
    df = pd.DataFrame([{"code_pos": "T-POS-IMP-1", "name": "Sans colonnes obligatoires"}])
    files = {"file": ("test.csv", _to_xlsx_bytes(df), "text/csv")}
    resp = client.post(
        f"/api/partners/{seed['p1']}/imports/validate",
        data={"entity_type": "POS"}, files=files, headers=auth_headers(rep1_token),
    )
    assert resp.status_code == 422


def test_import_rejects_row_with_unknown_relation(client, rep1_token, seed):
    df = pd.DataFrame([{
        "code_pos": "T-POS-IMP-2", "name": "DSM inconnu", "dsm_matricule": "DSM-INEXISTANT",
        "date_creation": "2026-01-01", "date_expiration": "2027-01-01",
    }])
    files = {"file": ("test.csv", _to_xlsx_bytes(df), "text/csv")}
    resp = client.post(
        f"/api/partners/{seed['p1']}/imports/validate",
        data={"entity_type": "POS"}, files=files, headers=auth_headers(rep1_token),
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["batch"]["status"] == "FAILED"
    assert body["batch"]["valid_rows"] == 0
    assert len(body["errors"]) >= 1
    assert body["errors"][0]["field"] == "dsm_matricule"


def test_import_apply_writes_valid_rows_to_database(client, rep1_token, seed):
    df = pd.DataFrame([{
        "code_pos": "T-POS-IMP-OK", "name": "POS importe", "dsm_matricule": "T-DSM1",
        "date_creation": "2026-01-01", "date_expiration": "2027-01-01",
    }])
    files = {"file": ("test.csv", _to_xlsx_bytes(df), "text/csv")}
    validate_resp = client.post(
        f"/api/partners/{seed['p1']}/imports/validate",
        data={"entity_type": "POS"}, files=files, headers=auth_headers(rep1_token),
    )
    assert validate_resp.status_code == 200
    batch = validate_resp.json()["batch"]
    assert batch["status"] == "VALIDATED"
    batch_id = batch["id"]

    before = client.get(f"/api/partners/{seed['p1']}/pos/", headers=auth_headers(rep1_token)) \
        if False else client.get(f"/api/partners/{seed['p1']}/pos", headers=auth_headers(rep1_token))
    total_before = before.json()["total"]

    apply_resp = client.post(
        f"/api/partners/{seed['p1']}/imports/{batch_id}/apply", headers=auth_headers(rep1_token),
    )
    assert apply_resp.status_code == 200
    assert apply_resp.json()["applied_rows"] == 1

    after = client.get(f"/api/partners/{seed['p1']}/pos", headers=auth_headers(rep1_token))
    total_after = after.json()["total"]
    assert total_after == total_before + 1

    codes = [p["code_pos"] for p in after.json()["items"]]
    assert "T-POS-IMP-OK" in codes


def test_import_batch_isolated_by_partner_context(client, rep1_token, seed):
    # rep1 n'a pas acces a p2 : la validation d'un import dans p2 doit etre 403
    df = pd.DataFrame([{"code_pos": "X", "name": "X", "dsm_matricule": "X",
                         "date_creation": "2026-01-01", "date_expiration": "2027-01-01"}])
    files = {"file": ("test.xlsx", _to_xlsx_bytes(df),
                       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    resp = client.post(
        f"/api/partners/{seed['p2']}/imports/validate",
        data={"entity_type": "POS"}, files=files, headers=auth_headers(rep1_token),
    )
    assert resp.status_code == 403
