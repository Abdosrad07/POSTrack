# POSTrack — Backend

API REST FastAPI pour la gestion Partenaires → DSM → BTS → POS.

## Documentation

| Guide | Lien |
|---|---|
| Installation | [docs/guides/GETTING_STARTED.md](../docs/guides/GETTING_STARTED.md) |
| Données de démo | [docs/guides/DATASETUP.md](../docs/guides/DATASETUP.md) |
| Roadmap J1–J14 | [docs/backend/ROADMAP.md](../docs/backend/ROADMAP.md) |
| Structure projet | [docs/architecture/PROJECT_STRUCTURE.md](../docs/architecture/PROJECT_STRUCTURE.md) |

## Démarrage rapide

```powershell
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
.\venv\Scripts\alembic upgrade head
.\venv\Scripts\python scripts/import_database.py
.\venv\Scripts\python main.py
```

→ http://localhost:8000/docs

## Structure

```
backend/
├── main.py
├── alembic/           # Migrations
├── scripts/           # import_database.py, import_pos.py
└── app/
    ├── api/           # Routers REST
    ├── models/        # 12 entités SQLAlchemy
    ├── schemas/       # Pydantic
    ├── crud/
    ├── services/
    └── security/      # JWT, permissions
```

## Scripts utiles

| Commande | Action |
|---|---|
| `alembic upgrade head` | Créer/migrer les tables |
| `python scripts/import_database.py` | Importer seed.sql |
| `python scripts/import_database.py --force` | Réimporter tout |
| `python scripts/import_pos.py --commit` | Import Excel Master Color |
