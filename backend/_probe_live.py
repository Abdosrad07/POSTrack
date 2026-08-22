"""Probe du serveur LIVE (http://localhost:8000) - temporaire."""
import httpx

BASE = "http://localhost:8000"

r = httpx.post(f"{BASE}/api/auth/login", json={"username": "admin", "password": "admin123"}, timeout=10)
print("LOGIN ->", r.status_code)
token = r.json().get("access_token") if r.status_code == 200 else None
headers = {"Authorization": f"Bearer {token}"} if token else {}

paths = [
    "/api/partenaires",
    "/api/partenaires?limit=100",
    "/api/partners/1/pos?page=1&limit=20&sort_by=date_creation&order=desc",
    "/api/partners/1/dsm?limit=100",
    "/api/partners/1/bts",
    "/api/partners/1/sim?limit=100",
    "/api/partners/2/requests?limit=100",
    "/api/partners/2/primes",
    "/api/partners/1/pos/1/reconductions",
]
for p in paths:
    try:
        resp = httpx.get(f"{BASE}{p}", headers=headers, timeout=10)
        body = resp.text[:110].replace("\n", " ")
        print(p, "->", resp.status_code, body)
    except Exception as exc:  # noqa: BLE001
        print(p, "-> EXC", exc)
