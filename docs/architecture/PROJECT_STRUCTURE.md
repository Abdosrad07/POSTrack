# Structure du projet POSTrack

Vue d'ensemble de l'organisation des fichiers.

```
POSTrack/
│
├── docs/                       # 📚 Documentation centralisée (commencer ici)
│   ├── README.md               # Index
│   ├── guides/                 # Démarrage, données
│   ├── architecture/           # Structure projet
│   ├── database/               # Doc équipe DB
│   ├── backend/                # Roadmap backend
│   └── frontend/               # Doc frontend
│
├── backend/                    # ⚙️ API FastAPI
│   ├── main.py
│   ├── alembic/                # Migrations SQLite
│   ├── scripts/                # import_database.py, import_pos.py
│   ├── postrack.db             # Base locale (gitignored)
│   └── app/
│       ├── api/                # Routers : auth, partenaires, dsm, bts, pos, primes…
│       ├── models/             # 12 entités SQLAlchemy
│       ├── schemas/            # Validation Pydantic
│       ├── crud/
│       ├── services/
│       └── security/
│
├── frontend/                   # 🖥️ Interface React
│   ├── src/
│   │   ├── App.tsx             # Routes
│   │   ├── pages/              # Une page par écran
│   │   ├── components/         # UI par domaine (POS, BTS, Common…)
│   │   ├── services/           # Client API axios
│   │   └── context/            # Auth
│   └── docs/                   # Workflows équipe frontend
│
└── database/                   # 🗄️ Sources SQL (équipe DB)
    ├── schema.sql
    ├── seed.sql
    ├── sql/                    # Vues
    ├── queries/
    ├── imports/                # Excel + script legacy
    └── docs/                   # Dictionnaire de données
```

## Où trouver quoi ?

| Besoin | Emplacement |
|---|---|
| Lancer le projet | [docs/guides/GETTING_STARTED.md](../guides/GETTING_STARTED.md) |
| Importer les données | [docs/guides/DATASETUP.md](../guides/DATASETUP.md) |
| Schéma SQL / seed | `database/schema.sql`, `database/seed.sql` |
| API REST | `backend/app/api/` → Swagger `/docs` |
| Pages UI | `frontend/src/pages/` |
| Appels API frontend | `frontend/src/services/` |

## Fichiers à la racine

| Fichier | Rôle |
|---|---|
| `README.md` | Présentation du projet |
| `GEMINI.md` | Redirection → roadmap backend (outil IA) |
| `DATASETUP.md` | Redirection → guide données |
| `README_DB.md` | Redirection → doc database |

## Fichiers supprimés / à ignorer

- ~~`BTSListPage.jsx`~~, ~~`SaturationGauge.jsx`~~ à la racine — artefacts de merge (versions dans `frontend/src/`)
- `frontend/src/pages/PosList.tsx` — stub remplacé par `pages/pos/POSListPage.jsx`
- `frontend/src/components/Common/EmptyState/` — ancien scaffold, non utilisé

## Flux de données

```
database/seed.sql
       ↓
backend/scripts/import_database.py
       ↓
backend/postrack.db  ←→  FastAPI  ←→  frontend (axios)
```

## Équipes

| Équipe | Dossier principal | Doc |
|---|---|---|
| Base de données | `database/` | [docs/database/README.md](../database/README.md) |
| Backend | `backend/` | [docs/backend/ROADMAP.md](../backend/ROADMAP.md) |
| Frontend | `frontend/` | [docs/frontend/README.md](../frontend/README.md) |
