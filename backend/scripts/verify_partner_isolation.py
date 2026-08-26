"""Vérification fonctionnelle d'isolation multi-partenaires (audit final).

Scénario exécuté sur une base SQLite temporaire dédiée :
  1. Seed de 4 partenaires réels : Master Color, Glothelo, Odi, Seven,
     chacun avec son DSM et un nombre de POS distinct.
  2. Login ADMIN puis GET /api/auth/partenaires/available :
     les 4 partenaires actifs doivent être proposés.
  3. Pour chaque partenaire :
       - GET /api/partners/{id}/analytics/dashboard
         -> partner_name et pos_total doivent correspondre EXACTEMENT au seed.
       - GET /api/partners/{id}/pos
         -> tous les code_pos retournés doivent appartenir à CE partenaire.
  4. Anti-fuite globale : la somme des pos_total doit égaler le total seedé.

Usage : venv\\Scripts\\python.exe scripts\\verify_partner_isolation.py
"""
import os
import sys
from datetime import date, timedelta

os.environ["DATABASE_URL"] = "sqlite:///./verify_isolation.db"
os.environ["SECRET_KEY"] = "verify-secret-not-for-production"

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if os.path.exists("verify_isolation.db"):
    os.remove("verify_isolation.db")

from fastapi.testclient import TestClient  # noqa: E402

from app.core.database import SessionLocal, Base, engine  # noqa: E402
from app import models as _all_models  # noqa: F401,E402
from app.main import app  # noqa: E402
from app.models.partner import Partner  # noqa: E402
from app.models.dsm import DSM  # noqa: E402
from app.models.user import User  # noqa: E402
from app.models.pos import POS, TypePos  # noqa: E402
from app.security.password import hash_password  # noqa: E402
from app.security.permissions import Role  # noqa: E402

PARTNERS = [
    ("PART-MC", "Master Color", 3),
    ("PART-GL", "Glothelo", 2),
    ("PART-ODI", "Odi", 1),
    ("PART-SEV", "Seven", 4),
]

BASE = date.today()


def seed():
    db = SessionLocal()
    ids = {}
    for code, name, nb_pos in PARTNERS:
        partner = Partner(code=code, name=name)
        db.add(partner)
        db.commit()
        db.refresh(partner)

        dsm = DSM(matricule=f"DSM-{code}", full_name=f"DSM {name}", partner_id=partner.id)
        db.add(dsm)
        db.commit()
        db.refresh(dsm)

        for i in range(nb_pos):
            db.add(
                POS(
                    code_pos=f"{code}-POS-{i + 1:03d}",
                    name=f"POS {name} #{i + 1}",
                    partner_id=partner.id,
                    dsm_id=dsm.id,
                    type_pos=TypePos.NOUVEAU if i % 2 == 0 else TypePos.RECONDUIT,
                    date_creation=BASE - timedelta(days=30 * (i + 1)),
                    date_expiration=BASE + timedelta(days=300 - i),
                    stock_initial=20 + i,
                    stock_actuel=15 + i,
                )
            )
        db.commit()
        ids[code] = partner.id

    db.add(
        User(
            username="admin_audit",
            email="admin_audit@postrack.local",
            role=Role.ADMIN,
            hashed_password=hash_password("Pwd@Audit2026"),
        )
    )
    db.commit()
    db.close()
    return ids


def main():
    Base.metadata.create_all(bind=engine)
    ids = seed()

    client = TestClient(app)
    login = client.post(
        "/api/auth/login",
        json={"username": "admin_audit", "password": "Pwd@Audit2026"},
    )
    assert login.status_code == 200, login.text
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    # 1. Référentiel : les 4 partenaires actifs sont proposés à la sélection.
    avail = client.get("/api/auth/partenaires/available", headers=headers)
    assert avail.status_code == 200, avail.text
    available_codes = sorted(p["code"] for p in avail.json())
    expected_codes = sorted(code for code, _, _ in PARTNERS)
    print(f"[OK] Referentiel disponible : {available_codes}")
    assert available_codes == expected_codes, "Partenaires manquants dans la selection"

    # 2. Isolation par partenaire.
    total_expected = sum(nb for _, _, nb in PARTNERS)
    total_seen = 0
    failures = []
    print("-" * 74)
    print(f"{'Partenaire':<14}{'partner_name':<16}{'pos_total':>10}{'attendu':>9}{'statut':>8}")
    print("-" * 74)

    for code, name, nb in PARTNERS:
        pid = ids[code]

        dash = client.get(f"/api/partners/{pid}/analytics/dashboard", headers=headers)
        if dash.status_code != 200:
            failures.append(f"{code}: dashboard HTTP {dash.status_code}")
            continue
        data = dash.json()

        pos_list = client.get(f"/api/partners/{pid}/pos?limit=100", headers=headers)
        body = pos_list.json()
        items = body.get("items", []) if isinstance(body, dict) else (body or [])
        codes_seen = [p.get("code_pos") for p in items]
        leak = [c for c in codes_seen if not str(c).startswith(code)]

        ok = (
            data.get("partner_name") == name
            and data.get("pos_total") == nb
            and not leak
            and len(codes_seen) == nb
        )
        total_seen += int(data.get("pos_total") or 0)

        status = "OK" if ok else "ECHEC"
        if not ok:
            failures.append(
                f"{code}: name={data.get('partner_name')!r} total={data.get('pos_total')} "
                f"(attendu {nb}), codes={codes_seen}, fuites={leak}"
            )
        print(f"{code:<14}{str(data.get('partner_name')):<16}{data.get('pos_total'):>10}{nb:>9}{status:>8}")

    print("-" * 74)
    print(f"Somme pos_total = {total_seen} / attendu {total_expected}")
    if total_seen != total_expected:
        failures.append(f"Somme des pos_total incorrecte ({total_seen} != {total_expected})")

    engine.dispose()
    if os.path.exists("verify_isolation.db"):
        os.remove("verify_isolation.db")

    if failures:
        print("\nECHECS :")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    print("\nISOLATION VERIFIEE : aucune donnee ne traverse les perimetres.")


if __name__ == "__main__":
    main()
