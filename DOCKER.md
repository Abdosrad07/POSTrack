# POSTrack — Docker

Stack complète en trois conteneurs : **db** (MySQL 8), **api** (FastAPI/uvicorn),
**web** (Nginx servant le bundle Vite et proxifiant `/api`).

## Démarrage

```powershell
# 1. Lancer Docker Desktop, puis depuis la racine du dépôt :
docker compose up --build
```

| Service | URL | Notes |
|---|---|---|
| web (frontend) | http://localhost:8080 | point d'entrée unique, `/api` proxifié vers l'API |
| api (backend)  | http://localhost:8000 | Swagger : http://localhost:8000/docs |
| db (MySQL)     | localhost:3306 | publié pour debug uniquement |

Aucune configuration CORS nécessaire : le navigateur appelle le front en
same-origin et Nginx relaie `/api` vers `api:8000`.

## Données de démonstration

Après le premier démarrage (base vide, migrations appliquées automatiquement) :

```powershell
docker compose exec api python scripts/seed_v4.py          # jeu minimal (destructif)
docker compose exec api python scripts/seed_rich_demo.py   # enrichissement additif
```

Comptes : `admin/admin123` (ADMIN), `manager/manager123`, `chef/chef123`.

## Persistance

- `postrack_mysql_data` : données MySQL survivent aux `down`/`up`.
- `postrack_imports` : rapports d'import Excel de l'API.

Réinitialisation complète : `docker compose down -v` (supprime les volumes).

## Build frontend seul

```powershell
docker build -t postrack-web ./frontend
# URL d'API différente (déploiement sans proxy) :
docker build --build-arg VITE_API_URL=https://api.exemple.com/api -t postrack-web ./frontend
docker run -p 8080:80 postrack-web   # sans proxy /api si URL absolue
```

## Notes

- Le backend applique `alembic upgrade head` à chaque démarrage du conteneur.
- En production réelle : restreindre `ALLOWED_ORIGINS`, changer `SECRET_KEY`,
  retirer la publication du port MySQL.
