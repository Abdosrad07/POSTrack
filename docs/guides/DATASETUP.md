# DATASETUP — Construire les données POSTrack

Ce guide explique comment peupler la base de données du projet à partir des fichiers de l'équipe DB (`database/`) et la connecter au backend FastAPI.

---

## Vue d'ensemble

POSTrack utilise **deux emplacements** liés aux données :

| Emplacement | Fichier généré | Utilisé par |
|---|---|---|
| `database/` | `database/postrack.db` (optionnel) | Scripts SQL bruts, imports Excel standalone |
| `backend/` | `backend/postrack.db` | **API FastAPI + frontend** ← cible principale |

Pour la démo et le développement, **c'est `backend/postrack.db` qui compte**. Les scripts Python du backend importent le contenu de `database/seed.sql` et des fichiers Excel.

```
database/
├── schema.sql          # Schéma SQL complet (12 tables, triggers, index)
├── seed.sql            # Jeu de données de référence (source de vérité métier)
├── imports/            # Fichiers Excel partenaires + import_pos.py (legacy)
└── sql/                # Vues SQL (v_pos_detail, v_dsm_charge, …)

backend/
├── postrack.db         # Base SQLite utilisée par l'API  ← généré localement
└── scripts/
    ├── import_database.py   # Import seed.sql → postrack.db (recommandé)
    ├── import_pos.py        # Import Excel Master Color → postrack.db
    └── seed.py              # Alias de import_database.py
```

---

## Prérequis

- Python 3.11+
- Node.js 18+ (frontend)
- Environnement backend activé :

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

---

## Étape 1 — Créer le schéma (tables vides)

Depuis `backend/` :

```powershell
.\venv\Scripts\alembic upgrade head
```

Cela crée `backend/postrack.db` avec les **12 tables** du modèle SQLAlchemy.

Vérification : `curl http://localhost:8000/health` → `{"status":"ok","database":"connected"}`

---

## Étape 2 — Importer les données de référence (seed)

```powershell
cd backend
.\venv\Scripts\python scripts/import_database.py
```

**Réimporter depuis zéro** : `.\venv\Scripts\python scripts/import_database.py --force`

### Contenu importé

| Entité | Quantité |
|---|---|
| Utilisateurs | 6 |
| Partenaires | 3 |
| DSM | 3 |
| POS | 6 |
| Primes | 3 |
| BTS + relevés | 1 + 3 |
| Clients, SIMs, Requêtes | 1 + 5 + 1 |

### Comptes de connexion

| Email | Mot de passe | Rôle |
|---|---|---|
| `admin@postrack.local` | `admin123` | ADMIN |
| `manager@postrack.local` | `manager123` | MANAGER |
| `dsm@postrack.local` | `dsm123` | DSM |
| `viewer@postrack.local` | `viewer123` | VIEWER |

---

## Étape 3 (optionnel) — Import Excel Master Color

```powershell
cd backend
.\venv\Scripts\python scripts/import_pos.py --dry-run   # simulation
.\venv\Scripts\python scripts/import_pos.py --commit    # écriture réelle
```

Fichiers source : `database/imports/MASTER_COLOR_*.xlsx`

---

## Étape 4 — Lancer l'application

Voir [GETTING_STARTED.md](GETTING_STARTED.md).

---

## Repartir d'une base propre

```powershell
cd backend
Remove-Item postrack.db -ErrorAction SilentlyContinue
.\venv\Scripts\alembic upgrade head
.\venv\Scripts\python scripts/import_database.py
```

---

## Références

| Fichier | Description |
|---|---|
| [database/seed.sql](../../database/seed.sql) | Données source équipe DB |
| [database/schema.sql](../../database/schema.sql) | Schéma SQL avec triggers |
| [database/README.md](../database/README.md) | Doc complète équipe DB |
| [backend/scripts/import_database.py](../../backend/scripts/import_database.py) | Script d'import principal |
