# POSTrack — Backend

API REST de la plateforme **POSTrack**, dédiée à la gestion et au suivi des créations et reconductions de Points de Vente (POS), en lien avec les Partenaires, les DSM (District Sales Manager) et les BTS (Base Transceiver Station).

Backend développé avec **FastAPI**, **SQLAlchemy** et **SQLite**, avec authentification **JWT** et gestion de rôles.

---

## Sommaire

- [Contexte](#contexte)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancement](#lancement)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Structure du projet](#structure-du-projet)
- [Modèle de données](#modèle-de-données)
- [Authentification et rôles](#authentification-et-rôles)
- [Endpoints principaux](#endpoints-principaux)
- [Tests](#tests)
- [Documentation interactive](#documentation-interactive)
- [Déploiement](#déploiement)
- [Roadmap V2](#roadmap-v2)

---

## Contexte

POSTrack centralise le suivi du cycle de vie des POS exploités par des Partenaires (distributeurs), supervisés par des DSM, et s'appuie sur les indicateurs de performance des BTS (rendement, taux de saturation) pour objectiver les décisions de création ou de reconduction de POS.

Quatre entités métier centrales :

- **Partenaire** — société distributrice, possède POS et BTS
- **DSM** — superviseur régional, responsable du suivi opérationnel des POS
- **BTS** — infrastructure réseau rattachée à un Partenaire (jamais directement à un POS)
- **POS** — point de vente rattaché à exactement un Partenaire et un DSM

## Stack technique

| Composant | Rôle |
|---|---|
| **FastAPI** | Framework API, validation, documentation auto-générée |
| **SQLAlchemy** | ORM, modèles de persistance |
| **Pydantic** | Schémas de validation / sérialisation |
| **SQLite** | Base de données (fichier unique, MVP) |
| **JWT** | Authentification stateless (access + refresh token) |
| **Pandas / OpenPyXL** | Import / export Excel des POS |

## Prérequis

- Python 3.9 ou supérieur
- pip et venv

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/Olavic21/postrack.git
cd postrack/backend

# Créer et activer l'environnement virtuel
python -m venv venv
source venv/bin/activate        # Windows : venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt
```

## Configuration

Copier le fichier d'exemple et renseigner les variables d'environnement :

```bash
cp .env.example .env
```

Variables principales à définir dans `.env` :

- `SECRET_KEY` — clé secrète utilisée pour signer les JWT
- `DATABASE_URL` — chaîne de connexion SQLite (ex. `sqlite:///./postrack.db`)

## Lancement

```bash
# Initialiser le schéma de base de données
python scripts/init_db.py

# Charger un jeu de données de démonstration
python scripts/seed.py

# Démarrer le serveur
python main.py
```

L'API est accessible sur **http://localhost:8000**.

## Comptes de démonstration

Créés automatiquement par le script `seed.py` :

| Rôle | Email | Mot de passe |
|---|---|---|
| ADMIN | admin@postrack.local | admin123 |
| MANAGER | manager@postrack.local | manager123 |
| DSM | dsm@postrack.local | dsm123 |

## Structure du projet

```
backend/
├── main.py                  # Point d'entrée, montage des routers
├── requirements.txt
├── .env.example
├── postrack.db               # Base SQLite (gitignored)
│
├── app/
│   ├── config.py             # Configuration (DB, JWT, CORS)
│   ├── database.py           # Session SQLAlchemy
│   │
│   ├── schemas/               # Schémas Pydantic (validation)
│   ├── models/                 # Modèles SQLAlchemy (ORM)
│   ├── crud/                   # Opérations base de données
│   │
│   ├── api/                    # Routes REST
│   │   ├── auth.py             # /auth/*
│   │   ├── partenaires.py      # /api/partenaires
│   │   ├── dsm.py              # /api/dsm
│   │   ├── bts.py              # /api/bts
│   │   ├── pos.py              # /api/pos
│   │   ├── users.py            # /api/users
│   │   ├── analytics.py        # /api/analytics/*
│   │   ├── import_export.py    # /api/excel/*
│   │   └── router.py           # Agrégation des routers
│   │
│   ├── security/
│   │   ├── jwt.py
│   │   ├── password.py
│   │   └── permissions.py      # Contrôle des rôles par endpoint
│   │
│   ├── services/                # Logique métier
│   │   ├── pos_service.py       # Règles de transition de statut
│   │   ├── bts_service.py       # Calcul saturation / rendement
│   │   ├── excel_service.py     # Import/export Pandas + OpenPyXL
│   │   └── analytics_service.py # Agrégations pour les dashboards
│   │
│   ├── utils/
│   └── exceptions/
│
├── tests/
└── uploads/                   # Fichiers Excel importés (gitignored)
```

Les modules `partenaires`, `dsm` et `bts` suivent le même patron que le module `pos`.

## Modèle de données

6 tables : `users`, `partenaires`, `dsm`, `bts`, `pos`, `audit_logs`.

Règles de gestion principales :

- Un **POS** est obligatoirement rattaché à un Partenaire et un DSM **actifs**.
- Une **BTS** est toujours rattachée à un Partenaire ; jamais directement à un POS.
- Le taux de saturation d'une BTS = `charge_actuelle / capacite_max × 100`.
- Un Partenaire ne peut être désactivé que si aucun POS actif ne lui est rattaché.
- Toute transition de statut d'un POS est journalisée dans `audit_logs` (ancien / nouveau statut).

Statuts POS : `ACTIF` · `SUSPENDU` · `RENOUVELLEMENT` · `CLOTURE`

## Authentification et rôles

Authentification par JWT (access token 60 min + refresh token 7 jours) :

```
POST /auth/login          → { access_token, refresh_token }
Authorization: Bearer <access_token>
POST /auth/refresh         → renouvelle l'access_token
```

Matrice des rôles :

| Rôle | Portée |
|---|---|
| **ADMIN** | Accès complet : utilisateurs, suppression, audit |
| **MANAGER** | Création/modification Partenaires, DSM, BTS, POS ; dashboards |
| **DSM** | Consultation et mise à jour des POS de sa propre zone uniquement |
| **VIEWER** | Lecture seule sur l'ensemble des données |

## Endpoints principaux

Tous les endpoints métier sont préfixés par `/api`.

| Ressource | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` |
| Partenaires | `GET/POST /api/partenaires`, `GET/PUT/DELETE /api/partenaires/{id}` |
| DSM | `GET/POST /api/dsm`, `GET/PUT/DELETE /api/dsm/{id}` |
| BTS | `GET/POST /api/bts`, `GET/PUT/DELETE /api/bts/{id}`, `GET /api/bts/{id}/saturation` |
| POS | `GET/POST /api/pos`, `GET/PUT/DELETE /api/pos/{id}`, `PATCH /api/pos/{id}/status` |
| Users (Admin) | `GET/POST /api/users`, `PUT/DELETE /api/users/{id}` |
| Analytics | `GET /api/analytics/dashboard`, `/pos-by-partenaire`, `/pos-by-dsm`, `/bts-saturation`, `/expiring-soon`, `/trends` |
| Excel | `POST /api/excel/import`, `GET /api/excel/export`, `GET /api/excel/template` |
| Audit | `GET /api/audit/logs` (filtrable par `entity_type` et `entity_id`) |

Exemple — liste des POS avec filtres :

```
GET /api/pos?page=1&limit=20&statut=ACTIF&partenaire_id=3&region=Littoral
```

## Tests

```bash
pytest --cov=app tests/
```

Objectif de couverture : **≥ 70 %** sur les modules métier (CRUD des 4 entités, authentification, permissions par rôle).

## Documentation interactive

Une fois le serveur lancé, la documentation Swagger/OpenAPI est disponible sur :

**http://localhost:8000/docs**

## Déploiement

Le déploiement en production est hors périmètre du MVP. Pistes envisagées :

- Base de données : migration vers **PostgreSQL**
- Serveur applicatif : **Gunicorn + Uvicorn workers** derrière **Nginx**
- Conteneurisation : **Docker** / **Docker Compose**
- Hébergement : Render, Railway ou VPS

## Roadmap V2

- Migration PostgreSQL
- Docker & Docker Compose
- Mises à jour temps réel (WebSocket)
- Authentification renforcée (2FA / OAuth)
- Cartographie interactive des BTS et POS
- Alertes automatiques de saturation BTS
- Application mobile (React Native)
- Pipeline CI/CD

---

**Version du document source :** 2.0 — Août 2026
