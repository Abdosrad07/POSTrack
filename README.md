# POSTrack — Branche Backend

Cette branche regroupe le travail de l'équipe **Backend** (3 membres) du projet POSTrack : API FastAPI, modèles SQLAlchemy, migrations, authentification et logique métier.

> ⚠️ **Écart connu avec la branche Base de Données** : ce backend implémente les **12 entités** du cahier des charges v3.1 (dont `reconductions`, `primes`, `clients`, `bts_releves`, `sims`, `requetes`). Le README de la branche `database` n'en décrit que 6. À clarifier avec le lead DB avant fusion sur `develop`.

## Contenu de cette branche

```
backend/
├── main.py                # App FastAPI (endpoint /health, CORS)
├── requirements.txt       # Dépendances (SQLite intégré, pas de driver externe)
├── .env.example
├── alembic/                # Migrations (render_as_batch=True pour SQLite)
│   ├── env.py
│   └── versions/
└── app/
    ├── config.py           # Settings (Pydantic-settings, lit .env)
    ├── database.py         # engine, SessionLocal, Base, get_db(), PRAGMA foreign_keys=ON
    ├── models/              # 12 modèles SQLAlchemy
    │   ├── enums.py         # 13 énumérations métier
    │   ├── common.py        # TimestampMixin
    │   ├── user.py, partenaire.py, dsm.py, audit.py
    │   ├── pos.py, reconduction.py, prime.py
    │   └── client.py, bts.py, bts_releve.py, sim.py, requete.py
    ├── schemas/ crud/ api/ services/ security/   # dossiers prêts (Jours 3+)
```

## Schéma de données

12 tables : `users`, `partenaires`, `dsm`, `pos`, `reconductions`, `primes`, `clients`, `bts`, `bts_releves`, `sims`, `requetes`, `audit_logs`.

Relations principales :
- Un **Partenaire** possède plusieurs **POS** et exploite plusieurs **BTS**
- Un **DSM** supervise plusieurs **POS**
- Un **POS** porte un `type_pos` (`NOUVEAU`/`RECONDUIT`) ; chaque bascule est historisée dans **reconductions**
- Un **POS** de type `NOUVEAU` peut donner lieu à au plus une **Prime** (contrainte d'unicité sur `pos_id`)
- Une **BTS** est toujours rattachée à un Partenaire, jamais directement à un POS ; ses relevés sont historisés dans **bts_releves**
- Un **POS** enregistre des **Clients**, détient des **SIM** ; une SIM peut être assignée à un Client dès la vente
- Une **Requête** est rattachée à au plus une entité parmi Partenaire/POS/BTS/Client
- Chaque action est journalisée dans **audit_logs**

Voir `app/models/` pour le détail de chaque colonne et contrainte (types, FK, valeurs par défaut).

## Choix technique : SQLite

Le cahier des charges v3.1 prévoyait MySQL pour les accès concurrents multi-agences (section 2.1). L'équipe Backend a choisi SQLite pour ce projet — plus simple à faire tourner en local par 3 devs sur 14 jours, sans instance MySQL à installer/partager. Contrepartie : verrouillage en écriture si plusieurs process tapent sur le même fichier `.db` en même temps ; sans impact pour du développement/démo local.

## Installation

```bash
# Depuis la racine du dépôt
cd backend
python -m venv venv
source venv/bin/activate       # Windows : venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # rien à changer dedans pour du local
```

## Utilisation

```bash
# 1. Appliquer les migrations (crée les 12 tables dans postrack.db)
alembic upgrade head

# 2. Lancer l'API
python main.py                  # http://localhost:8000

# 3. Vérifier
# http://localhost:8000/health   -> {"status": "ok", "database": "connected"}
# http://localhost:8000/docs     -> Swagger interactif
```

Cela génère `backend/postrack.db` — **ce fichier n'est jamais commité** (voir `.gitignore`). Chaque personne régénère sa propre base localement avec `alembic upgrade head`.

## Comptes de démonstration

Pas encore de compte : l'authentification JWT (register/login, 4 rôles) est prévue au Jour 3 de la roadmap. Cette section sera mise à jour à ce moment-là.

## Tests

```bash
pytest --cov=app
```

Pas encore de suite de tests à ce stade (Jour 2) — les tests ciblés sur les règles Nouveau/Reconduit et Primes sont prévus au Jour 13 (objectif ≥ 70 % de couverture).

## Répartition de l'équipe

| Rôle | Fichiers |
|---|---|
| Lead — architecture, auth, Partenaires/DSM/BTS | `app/models/user.py`, `partenaire.py`, `dsm.py`, `audit.py` |
| Développeur — Cycle de vie POS | `app/models/pos.py`, `reconduction.py`, `prime.py` |
| Développeur — Chaîne Client | `app/models/client.py`, `bts.py`, `bts_releve.py`, `sim.py`, `requete.py` |

## Workflow Git

- Branches nommées `feature/<module>-<action>` depuis `develop`
- Pull Request obligatoire + revue par un membre d'une autre équipe avant fusion
- Toute PR touchant la règle Nouveau/Reconduit ou le module Primes doit être accompagnée d'un test automatisé
- Fusion de `develop` vers `main` en fin de journée avec livrable validé

Convention de commit :
```
feat(pos): ajouter le modèle POS avec type_pos
fix(primes): corriger la contrainte d'unicité pos_id
docs(readme): mettre à jour les instructions d'installation
test(reconduction): ajouter les tests d'intégrité
```
