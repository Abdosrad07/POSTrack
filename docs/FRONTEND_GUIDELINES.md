# POSTRACK — Guide de fonctionnement de l'équipe Frontend

**Version : 1.0**
**Projet : POSTrack**
**Équipe : Frontend — 3 développeurs**
**Stack : React + Vite + Tailwind CSS**
**Gestion de versions : Git + GitHub**

---

# 1. Objectif du document

Ce document définit les règles de travail de l'équipe Frontend afin de permettre aux trois développeurs de travailler **en parallèle**, tout en limitant :

- les conflits Git ;
- les modifications accidentelles du travail des autres ;
- les Pull Requests trop importantes ;
- les régressions ;
- les merges contenant du code non testé.

L'objectif est d'avoir un processus simple :

```text
Tâche
  ↓
Branche dédiée
  ↓
Développement
  ↓
Tests locaux
  ↓
Pull Request
  ↓
CI
  ↓
Code Review
  ↓
Merge dans develop
```

La stratégie Git du projet prévoit déjà une branche par fonctionnalité, une revue de code avant fusion dans `develop`, ainsi que des tests automatisés pour les fonctionnalités critiques.

---

# 2. Organisation de l'équipe Frontend

L'équipe Frontend est composée de trois développeurs.

## 2.1 Lead Frontend

Responsabilités :

- architecture React ;
- organisation des dossiers ;
- routing ;
- état global ;
- authentification côté frontend ;
- composants communs ;
- configuration Vite ;
- configuration ESLint ;
- configuration Vitest ;
- CI/CD frontend ;
- intégration des modules Partenaires, DSM et BTS ;
- contrôle de cohérence du code frontend.

Le Lead est également responsable des fichiers d'infrastructure partagés.

---

## 2.2 Développeur Frontend — Cycle de vie POS

Responsabilités :

- POS ;
- Reconductions ;
- Primes ;
- composants associés ;
- tests des fonctionnalités correspondantes.

Modules principaux :

```text
POS
Reconductions
Primes
```

La règle métier `NOUVEAU → RECONDUIT` et le module des primes sont considérés comme critiques.

---

## 2.3 Développeur Frontend — Chaîne Client

Responsabilités :

- Clients ;
- Stock SIM ;
- Requêtes ;
- Dashboard ;
- Import/Export ;
- composants associés ;
- tests des fonctionnalités correspondantes.

Modules principaux :

```text
Clients
SIM
Requêtes
Dashboard
Import/Export
```

Cette organisation correspond à la répartition fonctionnelle prévue dans la roadmap du projet.

---

# 3. Principe fondamental : chacun possède une zone du code

La règle principale est :

> **Une fonctionnalité appartient à un développeur et celui-ci travaille principalement dans les fichiers correspondant à cette fonctionnalité.**

Structure recommandée :

```text
src/
├── components/
│   ├── Common/
│   ├── Layout/
│   ├── POS/
│   ├── Primes/
│   ├── BTS/
│   ├── Sims/
│   ├── Requetes/
│   └── Dashboard/
│
├── pages/
│   ├── auth/
│   ├── partenaires/
│   ├── dsm/
│   ├── bts/
│   ├── pos/
│   ├── reconductions/
│   ├── primes/
│   ├── clients/
│   ├── sims/
│   ├── requetes/
│   ├── dashboard/
│   └── import-export/
│
├── services/
├── hooks/
├── context/
├── routes/
└── App.jsx
```

---

... (le document complet a été déplacé depuis un fichier inséré par erreur dans `src/components/Partenaires/PartenaireForm.jsx`)
