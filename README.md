# POSTrack — Branche Base de Données

Cette branche regroupe le travail de l'équipe **Base de Données** (3 membres) du projet POSTrack : conception du schéma, scripts de création, jeu de données de test, et documentation associée.

## Contenu de cette branche

```
docs/
├── MCD.drawio          # Modèle Conceptuel de Données (schéma entités/relations)
├── MLD.md               # Modèle Logique de Données (traduction texte du MCD)
└── dictionnaire.md      # Dictionnaire de données (colonnes, types, contraintes)

backend/
├── scripts/
│   ├── init_db.py       # Crée les 6 tables + index
│   └── seed.py           # Peuple la base avec des données de test
├── app/
│   └── database.py       # Connexion SQLAlchemy
└── tests/
    └── test_db_integrity.py   # Tests des contraintes d'intégrité
```

## Schéma de données

6 tables : `users`, `partenaires`, `dsm`, `bts`, `pos`, `audit_logs`.

Relations principales :
- Un **Partenaire** possède plusieurs **POS** et exploite plusieurs **BTS**
- Un **DSM** supervise plusieurs **POS**
- Une **BTS** est toujours rattachée à un Partenaire (jamais directement à un POS)
- Chaque action est journalisée dans **audit_logs**

Voir `docs/MCD.drawio` pour le schéma visuel complet et `docs/dictionnaire.md` pour le détail de chaque colonne.

## Installation

```bash
# Depuis la racine du dépôt
cd backend

python -m venv venv
source venv/bin/activate       # Windows : venv\Scripts\activate

pip install -r requirements.txt
pip install faker              # nécessaire pour seed.py

cp .env.example .env           # renseigner DATABASE_URL
```

## Utilisation

```bash
# 1. Créer le schéma (tables + index)
python scripts/init_db.py

# 2. Peupler avec des données de test
python scripts/seed.py

# 3. Vérifier visuellement (extension SQLite Viewer ou SQLTools dans VS Code)
```

Cela génère `backend/postrack.db` — **ce fichier n'est jamais commité** (voir `.gitignore`). Chaque personne régénère sa propre base localement avec les deux commandes ci-dessus.

## Comptes de démonstration créés par `seed.py`

| Rôle | Email | Mot de passe |
|---|---|---|
| ADMIN | admin@postrack.local | admin123 |
| MANAGER | manager@postrack.local | manager123 |
| DSM | dsm@postrack.local | dsm123 |

## Tests

```bash
pytest backend/tests/test_db_integrity.py
```

Vérifie notamment :
- Rejet d'un POS référençant un `partenaire_id` inexistant
- Unicité de `code_partenaire` et `matricule`
- Contraintes NOT NULL sur les champs obligatoires

## Répartition de l'équipe

| Rôle | Responsable | Fichiers |
|---|---|---|
| Lead — schéma & documentation | — | `docs/` |
| Développeur — données de test | Salem | `scripts/seed.py` |
| Développeur — contraintes & performance | — | `scripts/init_db.py`, `tests/` |

## Workflow Git

- Branches nommées `feature/<module>-<action>` depuis `develop`
- Pull Request obligatoire + revue par un membre d'une autre équipe avant fusion
- Fusion (squash) dans `develop`, puis `develop` → `main` en fin de journée avec livrable validé

Convention de commit :
```
feat(bts): calculer le taux de saturation à la création
fix(pos): corriger la validation du dsm_id
docs(readme): mettre à jour les instructions d'installation
test(dsm): ajouter les tests unitaires du CRUD DSM
```
# POSTrack

> **Plateforme centralisée de gestion et de suivi des Partenaires, DSM, BTS et Points de Vente (POS)**

![Version](https://img.shields.io/badge/version-1.0-blue)
![Backend](https://img.shields.io/badge/FastAPI-Python-success)
![Frontend](https://img.shields.io/badge/React-Vite-61DAFB)
![Database](https://img.shields.io/badge/SQLite-003B57)
![License](https://img.shields.io/badge/license-Interne-lightgrey)

---

# Présentation

**POSTrack** est une application web développée dans le cadre d'un projet académique visant à centraliser la gestion des **Partenaires**, **District Sales Managers (DSM)**, **BTS** et **Points de Vente (POS)**.

L'objectif est de remplacer les traitements manuels (Excel) par une plateforme unique permettant :

* la gestion des partenaires et des DSM ;
* le suivi des BTS et des POS ;
* l'import et l'export des données Excel ;
* la recherche multicritère ;
* les tableaux de bord décisionnels ;
* l'authentification sécurisée par rôles ;
* la traçabilité des opérations via un journal d'audit.

Le projet est conçu comme un **MVP réalisable en 14 jours** par une équipe de **9 étudiants répartis en trois équipes** (Base de données, Backend et Frontend).

---

# Objectifs

* Centraliser les informations des POS.
* Faciliter le suivi des partenaires et des DSM.
* Simplifier les opérations d'import/export Excel.
* Fournir des indicateurs décisionnels.
* Garantir la sécurité grâce à une gestion des rôles.
* Assurer la traçabilité des modifications.

---

# Fonctionnalités

## Authentification

* Connexion sécurisée
* JWT
* Gestion des rôles
* Routes protégées

## Gestion des partenaires

* Création
* Modification
* Suppression contrôlée
* Recherche

## Gestion des DSM

* CRUD complet
* Association avec un utilisateur

## Gestion des BTS

* CRUD
* Calcul du taux de saturation

## Gestion des POS

* Création
* Modification
* Suppression
* Recherche multicritère
* Pagination
* Tri

## Tableau de bord

* Statistiques générales
* Répartition des POS
* Indicateurs BTS
* Graphiques interactifs

## Import / Export

* Import Excel
* Validation des données
* Rapport d'erreurs
* Export Excel

## Audit

* Historique des opérations
* Journalisation automatique

---

# Architecture technique

## Frontend

* React
* Vite
* Tailwind CSS
* Axios
* React Router
* Recharts

## Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* JWT Authentication
* Pandas
* OpenPyXL

## Base de données

* SQLite

Architecture prévue pour une migration future vers PostgreSQL.

---

# Architecture du projet

```text
POSTrack/

backend/
frontend/
database/
docs/
uploads/
tests/
```

---

# Stack technique

| Couche            | Technologie       |
| ----------------- | ----------------- |
| Frontend          | React + Vite      |
| UI                | Tailwind CSS      |
| API               | Axios             |
| Graphiques        | Recharts          |
| Backend           | FastAPI           |
| ORM               | SQLAlchemy        |
| Validation        | Pydantic          |
| Authentification  | JWT               |
| Import Excel      | Pandas + OpenPyXL |
| Base de données   | SQLite            |
| Versionnement     | Git               |
| Gestion de projet | GitHub            |

---

# Organisation de l'équipe

Le projet est développé par **9 étudiants**, répartis en trois équipes :

## Équipe Base de données (3 membres)

* Modélisation des données
* Scripts SQL
* Jeux de données
* Optimisation
* Documentation du schéma

## Équipe Backend (3 membres)

* API REST
* Authentification
* Logique métier
* Import/Export Excel
* Tableau de bord
* Tests

## Équipe Frontend (3 membres)

* Interface utilisateur
* Intégration API
* Tableaux de bord
* Responsive Design
* Expérience utilisateur

Les équipes travaillent en parallèle avec une synchronisation quotidienne afin de garantir la cohérence du projet.

---

# Roadmap

Durée du projet :

**14 jours**

Principales étapes :

* Initialisation du projet
* Conception de la base de données
* Authentification
* Gestion des Partenaires
* Gestion des DSM
* Gestion des BTS
* Gestion des POS
* Import / Export Excel
* Dashboard
* Audit
* Tests
* Documentation
* Déploiement

La feuille de route est organisée avec des objectifs quotidiens, un point de synchronisation à **17h30** et un livrable vérifiable à la fin de chaque journée.

---

# Workflow Git

```
main
│
develop
│
├── feature/*
├── bugfix/*
└── hotfix/*
```

Chaque fonctionnalité est développée sur une branche dédiée avant d'être fusionnée dans `develop` via une Pull Request revue par un autre membre de l'équipe.

---

# Installation

## Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

python main.py
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# Outils utilisés

## Développement

* VS Code
* Git
* GitHub

## Base de données

* SQLite
* SQLTools
* DB Browser for SQLite

## API

* Swagger UI
* Thunder Client

---

# Tests

* Tests unitaires Backend
* Tests d'intégration
* Tests Frontend
* Tests manuels
* Validation des imports Excel

Objectif :

* **70 % de couverture minimale sur le backend** avant la fin du projet.

---

# Perspectives

Les évolutions prévues après le MVP comprennent notamment :

* Migration vers PostgreSQL
* Docker et Docker Compose
* Déploiement sur serveur
* Cartographie interactive
* Authentification renforcée
* Pipeline CI/CD
* Application mobile React Native
* Alertes automatiques de saturation BTS.

---

# Licence

Projet académique réalisé dans le cadre d'un travail de groupe.

Tous droits réservés.
