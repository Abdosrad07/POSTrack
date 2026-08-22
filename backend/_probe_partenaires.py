"""Probe temporaire : verifie les routes partenaires/hierarchy en direct."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

login = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
print("LOGIN ->", login.status_code)
token = login.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

for path in ("/api/partenaires", "/api/partenaires?limit=100", "/api/hierarchy"):
    resp = client.get(path, headers=headers)
    print(f"GET {path} -> {resp.status_code}")

registered = sorted({getattr(r, "path", "") for r in app.routes})
print("ROUTES partenaires:", [p for p in registered if "partenaires" in p])
