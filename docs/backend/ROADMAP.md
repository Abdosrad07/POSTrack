# Roadmap Backend — POSTrack

Suivi d'avancement de l'équipe Backend (14 jours).  
Mettre à jour les cases `[ ]` → `[x]` au fil des livrables.

> Fichier historique : `GEMINI.md` à la racine (redirection).

## Stack

- Python 3.11+, FastAPI, SQLAlchemy, Pydantic, Alembic
- SQLite (local) — MySQL prévu en production
- JWT (access + refresh), 4 rôles

## Arborescence

```
backend/
├── main.py              # Point d'entrée FastAPI
├── alembic/             # Migrations
├── scripts/             # import_database.py, import_pos.py, seed.py
└── app/
    ├── api/             # Routers REST
    ├── models/          # SQLAlchemy (12 entités)
    ├── schemas/         # Pydantic
    ├── crud/            # Accès base
    ├── services/        # Logique métier
    └── security/        # JWT, permissions
```

## Règles métier critiques

1. **Nouveau vs Reconduit** — bascule définitive, historisée dans `reconductions`
2. **Primes** — uniquement si `type_pos == NOUVEAU`, une seule par POS
3. **DSM** — accès limité à sa zone de couverture
4. **BTS relevés** — cache mis à jour à chaque nouveau relevé

## Avancement

### Semaine 1

- [x] Jour 1 — FastAPI, config, connexion DB
- [x] Jour 2 — 12 modèles + migrations Alembic
- [x] Jour 3 — Auth JWT (register, login, refresh, /me)
- [x] Jour 4 — CRUD partenaires + DSM
- [x] Jour 5 — CRUD BTS + relevés

### Semaine 2

- [x] Lecture POS, Primes, Dashboard (GET) — branchement démo
- [ ] Jour 8 — POST/PUT/PATCH POS complet
- [ ] Jour 9 — Reconductions + Primes (écriture)
- [ ] Jour 10 — Clients + SIMs
- [ ] Jour 11 — Requêtes + Import/Export Excel
- [ ] Jour 12 — Analytics complets + Audit auto
- [ ] Jour 13 — Tests pytest (≥ 70 %)
- [ ] Jour 14 — Déploiement démo

## Commandes

```powershell
cd backend
.\venv\Scripts\python main.py          # http://localhost:8000
.\venv\Scripts\pytest --cov=app        # tests
```

Voir [../guides/GETTING_STARTED.md](../guides/GETTING_STARTED.md) pour l'installation complète.
