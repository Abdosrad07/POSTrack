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
