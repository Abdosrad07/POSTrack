# GEMINI.md — POSTrack Backend

Ce fichier donne à Gemini le contexte du projet POSTrack pour t'aider à réviser
l'avancement de la roadmap Backend, relire du code, écrire des tests, et
vérifier la conformité aux règles métier. Mets à jour les cases à cocher
`[ ]` → `[x]` au fil des jours : c'est ce qui permet à Gemini de savoir où
vous en êtes réellement dans le planning.

## Rôle attendu de Gemini sur ce projet

- Agir comme relecteur technique pour l'équipe Backend (3 devs : Lead,
  dev "Cycle de vie POS", dev "Chaîne Client").
- Avant toute suggestion, vérifier la conformité aux règles métier
  ci-dessous (section "Règles métier critiques") — ce sont les points
  qui font échouer la recette si mal implémentés.
- Signaler explicitement tout écart entre le code et le planning J1-J14
  ci-dessous, plutôt que de supposer que tout est déjà fait.
- Ne jamais inventer un statut d'avancement : si une case n'est pas
  cochée, considérer la tâche comme non faite.

## Vue d'ensemble du projet

- **Nom** : POSTrack — plateforme de suivi de la chaîne
  Partenaire → DSM → POS → Client (+ SIM End User en V2).
- **Équipe** : 9 étudiants, 3 équipes de 3 (Base de Données, Backend,
  Frontend). Projet sur 14 jours.
- **Périmètre** : 12 entités — USERS, PARTENAIRES, DSM, POS,
  RECONDUCTIONS, PRIMES, CLIENTS, BTS, BTS_RELEVES, SIMS, REQUETES,
  AUDIT_LOGS.

## Stack technique (Backend)

- Python 3.9+, FastAPI, SQLAlchemy (ORM), Pydantic (schémas).
- MySQL 8.0+ via PyMySQL (remplace SQLite dès le MVP pour les accès
  concurrents multi-agences).
- JWT (access + refresh token) pour l'authentification, 4 rôles :
  ADMIN, MANAGER, DSM, VIEWER.
- Pandas + OpenPyXL pour l'import/export Excel des POS.
- pytest + TestClient FastAPI pour les tests (objectif ≥ 70 % de
  couverture sur POS / Reconductions / Primes).

## Arborescence Backend

```
backend/app/
├── schemas/    # Pydantic — validation/sérialisation
├── models/     # SQLAlchemy — persistance
├── crud/       # opérations base de données par entité
├── api/        # routers FastAPI (un fichier par module)
├── services/   # logique métier (pos_service, prime_service, bts_service,
│                 sim_service, excel_service, analytics_service)
└── security/   # jwt.py, password.py, permissions.py
```

## Règles métier critiques (à vérifier en priorité)

1. **Nouveau vs Reconduit** — un POS est créé avec `type_pos = NOUVEAU`.
   Une reconduction bascule `type_pos = RECONDUIT` de façon
   **définitive** (jamais de retour à NOUVEAU) et doit être historisée
   dans `RECONDUCTIONS` (date, ancienne/nouvelle date d'expiration,
   motif, validateur).
2. **Primes** — une Prime ne peut être créée que si `type_pos ==
   NOUVEAU` au moment de la demande ; rejet API explicite sinon. Un POS
   ne peut avoir qu'**une seule** Prime sur toute sa durée de vie
   (contrainte d'unicité sur `pos_id`). Cycle de statut : `EN_ATTENTE →
   VALIDEE → PAYEE` (ou `REJETEE`).
3. **Rôle DSM** — un utilisateur DSM ne voit/modifie que les POS,
   Clients, SIM et Requêtes de sa propre zone de couverture.
4. **Scénario de recette de référence** (doit passer intégralement,
   voir Jour 13) : création Partenaire/DSM/BTS → POS (auto NOUVEAU) →
   Prime acceptée → Client + vente SIM → relevé BTS → requête →
   reconduction (bascule RECONDUIT) → 2ème Prime **rejetée**.

## Roadmap Backend — 14 jours

### Semaine 1

- [ ] **Jour 1** — Initialisation FastAPI, config, connexion SQLAlchemy/MySQL.
- [ ] **Jour 2** — Modèles SQLAlchemy des 12 tables + migrations.
- [ ] **Jour 3** — `POST /auth/register`, `POST /auth/login` (JWT), middleware, 4 rôles.
- [ ] **Jour 4 (matin)** — CRUD complet `/api/partenaires`.
- [ ] **Jour 4 (après-midi)** — CRUD complet `/api/dsm`.
- [ ] **Jour 5 (matin)** — CRUD `/api/bts`.
- [ ] **Jour 5 (après-midi, P1)** — `/api/bts/{id}/releves` (GET historique, POST relevé, MAJ cache).

### Jours 6-7 — Tampon / rattrapage (non obligatoire)

### Semaine 2

- [ ] **Jour 8 (matin)** — `POST/PUT /api/pos` avec `partenaire_id`/`dsm_id`, `type_pos = NOUVEAU` auto.
- [ ] **Jour 8 (après-midi)** — `GET /api/pos` avec filtres avancés (dont `type_pos`), `PATCH /api/pos/{id}/status`.
- [ ] **Jour 9 (matin)** — `POST /api/pos/{id}/reconduction` (bascule RECONDUIT, historise, MAJ date_expiration).
- [ ] **Jour 9 (après-midi)** — Module Primes : `POST /api/primes` (validation stricte), `PATCH statut`.
- [ ] **Jour 10 (matin)** — CRUD `/api/clients` rattaché à un POS.
- [ ] **Jour 10 (après-midi, P1)** — CRUD `/api/sims` + `PATCH vendre/activer`.
- [ ] **Jour 11 (matin, P1)** — CRUD `/api/requetes` (rattachement multi-entités).
- [ ] **Jour 11 (après-midi)** — `excel_service.py` (import/export POS), endpoints `/api/excel/*`.
- [ ] **Jour 12 (matin)** — Endpoints `/api/analytics/*` (dashboard, pos-nouveau-vs-reconduit, bts-saturation, sims-stock, requetes-ouvertes).
- [ ] **Jour 12 (après-midi)** — Journalisation automatique dans `AUDIT_LOGS` sur toutes les entités.
- [ ] **Jour 13 (matin)** — Tests pytest ciblés Nouveau/Reconduit + Primes (≥ 70 % couverture).
- [ ] **Jour 13 (après-midi)** — UAT : scénario de recette de référence complet, sans erreur.
- [ ] **Jour 14** — Déploiement local final, jeu de données de démo propre.

## Endpoints de référence (contrat à respecter)

| Méthode | Endpoint | Accès |
|---|---|---|
| POST | `/api/pos/{id}/reconduction` | MANAGER+ |
| GET | `/api/pos/{id}/reconductions` | MANAGER+ |
| POST | `/api/primes` | MANAGER+ (rejet si POS ≠ NOUVEAU) |
| PATCH | `/api/primes/{id}/statut` | ADMIN |
| POST | `/api/bts/{id}/releves` | MANAGER+ |
| PATCH | `/api/sims/{id}/vendre` | MANAGER+ |
| POST | `/api/requetes` | Tous rôles authentifiés |

## Commandes utiles

```bash
# Lancer l'API en local
cd backend && python main.py        # http://localhost:8000
# Doc interactive
# http://localhost:8000/docs
# Tests
pytest --cov=app
```

## Ce que Gemini ne doit jamais faire

- Ne pas cocher une case de la roadmap tout seul — c'est à l'équipe de le faire une fois le livrable du jour validé en sync 17h30.
- Ne pas proposer de contourner la contrainte d'unicité Prime/POS ou la règle Nouveau/Reconduit, même "pour aller plus vite" en démo.
- Ne pas remplacer MySQL par SQLite dans les suggestions : le choix MySQL est arrêté pour tout le MVP (section 2.1 du cahier des charges).