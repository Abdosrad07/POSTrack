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
    └── seed.py                # Alias de import_database.py
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

Cela crée `backend/postrack.db` avec les **12 tables** du modèle SQLAlchemy (users, partenaires, dsm, pos, reconductions, primes, clients, bts, bts_releves, sims, requetes, audit_logs).

Vérification :

```powershell
curl http://localhost:8000/health
# → {"status":"ok","database":"connected"}
```

---

## Étape 2 — Importer les données de référence (seed)

Le script `import_database.py` charge le contenu de `database/seed.sql` adapté aux modèles backend :

```powershell
cd backend
.\venv\Scripts\python scripts/import_database.py
```

**Première importation** : exécution directe si la base est vide.

**Réimporter depuis zéro** (efface tout et recharge) :

```powershell
.\venv\Scripts\python scripts/import_database.py --force
```

### Contenu importé

| Entité | Quantité | Source |
|---|---|---|
| Utilisateurs | 6 | `database/seed.sql` + comptes frontend |
| Partenaires | 3 | Camtel Express, Master Color, Glothelo |
| DSM | 3 | 1 confirmé + 2 provisoires (Master Color) |
| POS | 6 | 2 démo + 4 Master Color |
| Reconductions | 1 | POS 102 bascule en RECONDUIT |
| Primes | 3 | EN_ATTENTE, VALIDEE, PAYEE |
| Clients | 1 | Paul Etoundi |
| BTS | 1 | Antenne Akwa + 3 relevés |
| SIMs | 5 | Tous statuts représentés |
| Requêtes | 1 | Rupture stock SIM |
| Audit logs | 4 | Traçabilité création POS/partenaires |

### Comptes de connexion

| Email | Mot de passe | Rôle | Origine |
|---|---|---|---|
| `admin@postrack.local` | `admin123` | ADMIN | Frontend (boutons login) |
| `manager@postrack.local` | `manager123` | MANAGER | Frontend |
| `dsm@postrack.local` | `dsm123` | DSM | Frontend |
| `viewer@postrack.local` | `viewer123` | VIEWER | Frontend |
| `admin@postrack.cm` | `admin123` | ADMIN | database/seed.sql |
| `dsm.douala@postrack.cm` | `dsm123` | DSM | database/seed.sql |

Les mots de passe sont hashés en **bcrypt** (compatibles avec l'API JWT).

---

## Étape 3 (optionnel) — Importer les fichiers Excel partenaires

Les fichiers réels Master Color se trouvent dans `database/imports/` :

- `MASTER_COLOR_JUILLET_2026.xlsx`
- `MASTER_COLOR_JUIN_2026.xlsx` *(référencé dans le script legacy)*

> **Note :** Les 4 POS Master Color du seed couvrent déjà un échantillon. L'import Excel ajoute les lignes complètes des fichiers si vous souhaitez la totalité des données.

**Simulation (sans écriture) :**

```powershell
cd backend
.\venv\Scripts\python scripts/import_pos.py --dry-run
```

**Import réel :**

```powershell
.\venv\Scripts\python scripts/import_pos.py --commit
```

Un rapport CSV est généré dans `backend/scripts/rapport_import_YYYYMMDD.csv`.

Prérequis : le partenaire `PART-MC` (Master Color) doit exister — assuré par l'étape 2.

---

## Étape 4 — Lancer l'application

**Backend :**

```powershell
cd backend
.\venv\Scripts\python main.py
# → http://localhost:8000
# → http://localhost:8000/docs (Swagger)
```

**Frontend :**

```powershell
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Se connecter avec `admin@postrack.local` / `admin123`, puis naviguer vers Partenaires, DSM, BTS.

---

## Repartir d'une base propre

```powershell
cd backend

# Supprimer la base existante
Remove-Item postrack.db -ErrorAction SilentlyContinue

# Recréer le schéma
.\venv\Scripts\alembic upgrade head

# Réimporter les données
.\venv\Scripts\python scripts/import_database.py
```

---

## Différences schema database/ vs backend/

Le dossier `database/` et le backend Alembic partagent le même modèle métier (12 tables) mais quelques écarts existent :

| Élément | `database/schema.sql` | Backend SQLAlchemy |
|---|---|---|
| `est_provisoire` | Colonne sur partenaires/dsm | Absent — identifié via le nom/matricule `DSM-TEMP-*` |
| `quartier`, `lieu_dit`, `montant_initial` | Colonnes POS dédiées | Regroupés dans `adresse` et `notes` |
| Triggers SQL | Reconduction → type_pos, relevé → cache BTS | Géré en Python (`import_database.py`, `bts_service.py`) |
| Vues SQL | `v_pos_detail`, `v_dsm_charge`, … | Non créées dans backend — à recréer manuellement si besoin |

Ces adaptations sont appliquées automatiquement par `import_database.py`.

---

## Pipeline SQL pur (équipe DB uniquement)

Si vous voulez travailler **uniquement** avec les scripts SQL bruts (sans l'API) :

```powershell
cd database

Get-Content schema.sql | sqlite3 postrack.db
Get-Content seed.sql | sqlite3 postrack.db
Get-Content sql\04_vues.sql | sqlite3 postrack.db
Get-Content sql\05_bts_historique.sql | sqlite3 postrack.db
```

Cela produit `database/postrack.db` — **distinct** de `backend/postrack.db`. Pour la démo avec le frontend, utilisez toujours le pipeline backend (étapes 1–4 ci-dessus).

---

## Vérifications rapides

```powershell
# Compter les enregistrements
cd backend
.\venv\Scripts\python -c "
import sqlite3
c = sqlite3.connect('postrack.db')
for t in ['users','partenaires','dsm','pos','primes','bts','clients','sims']:
    print(t, c.execute(f'SELECT COUNT(*) FROM {t}').fetchone()[0])
"

# Tester l'API avec un token
$login = Invoke-RestMethod -Uri http://localhost:8000/api/auth/login -Method POST -ContentType application/json -Body '{\"email\":\"admin@postrack.local\",\"password\":\"admin123\"}'
$token = $login.access_token
Invoke-RestMethod -Uri http://localhost:8000/api/partenaires -Headers @{Authorization=\"Bearer $token\"}
```

---

## Fichiers de référence

| Fichier | Description |
|---|---|
| [database/seed.sql](database/seed.sql) | Jeu de données source (équipe DB) |
| [database/schema.sql](database/schema.sql) | Schéma SQL complet avec triggers |
| [database/docs/dictionnaire_donnees.md](database/docs/dictionnaire_donnees.md) | Dictionnaire de données |
| [README_DB.md](README_DB.md) | Documentation équipe DB (vues, requêtes, workflow Git) |
| [backend/scripts/import_database.py](backend/scripts/import_database.py) | Script d'import principal |
| [backend/scripts/import_pos.py](backend/scripts/import_pos.py) | Import Excel partenaires |

---

## Workflow recommandé pour une démo client

1. `alembic upgrade head`
2. `python scripts/import_database.py`
3. `python main.py` (backend)
4. `npm run dev` (frontend)
5. Login `admin@postrack.local` / `admin123`
6. Présenter : Partenaires (3), DSM (3), BTS (saturation 82 %), POS Master Color

Pour enrichir avec les Excel complets : ajouter `--commit` à `import_pos.py` avant la démo.
