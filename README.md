# POSTrack

> Plateforme de gestion et suivi de la chaîne **Partenaire → DSM → BTS → POS → Client**

Application web académique (MVP 14 jours) — 3 équipes : Base de données, Backend, Frontend.

## Démarrage en 2 minutes

```powershell
# Backend
cd backend
.\venv\Scripts\activate
.\venv\Scripts\python main.py

# Frontend (autre terminal)
cd frontend
npm run dev
```

→ http://localhost:5173 — login : `admin@postrack.local` / `admin123`

**Première installation ?** Voir [docs/guides/GETTING_STARTED.md](docs/guides/GETTING_STARTED.md)

## Documentation

| Guide | Contenu |
|---|---|
| **[docs/README.md](docs/README.md)** | Index de toute la documentation |
| [docs/guides/GETTING_STARTED.md](docs/guides/GETTING_STARTED.md) | Installation complète |
| [docs/guides/DATASETUP.md](docs/guides/DATASETUP.md) | Importer les données de démo |
| [docs/architecture/PROJECT_STRUCTURE.md](docs/architecture/PROJECT_STRUCTURE.md) | Organisation des fichiers |

## Architecture

```
POSTrack/
├── backend/      # FastAPI + SQLAlchemy + SQLite
├── frontend/     # React + Vite + Tailwind
├── database/     # Schéma SQL, seed, imports Excel
└── docs/         # Documentation centralisée
```

## Stack

| Couche | Technologie |
|---|---|
| Frontend | React 19, Vite, Tailwind, Axios |
| Backend | Python, FastAPI, SQLAlchemy, JWT |
| Base | SQLite (Alembic migrations) |

## Fonctionnalités (état actuel)

- Authentification JWT (4 rôles)
- CRUD Partenaires, DSM, BTS (+ relevés)
- Lecture POS, Primes, Dashboard
- Données de démo importables depuis `database/seed.sql`

## API

- Swagger : http://localhost:8000/docs
- Health : http://localhost:8000/health

## Équipe

9 étudiants — 3 par équipe (DB, Backend, Frontend).

## Licence

Projet académique — tous droits réservés.
