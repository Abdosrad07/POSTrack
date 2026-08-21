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
- SQLite (choix de l'équipe Backend pour ce projet — le cahier des
  charges v3.1 prévoyait MySQL pour les accès concurrents
  multi-agences ; à garder en tête si le référent client le demande
  en recette).
- JWT (access + refresh token) pour l'authentification, 4 rôles :
  ADMIN, PARTENAIRE (Représentant Partenaire), DSM (Représentant DSM),
  POS_HOLDER (Détenteur POS).
- Pandas + OpenPyXL pour l'import/export Excel des POS.
- pytest + TestClient FastAPI pour les tests (objectif ≥ 70 % de
  couverture sur POS / Reconductions / Primes).

## Arborescence Backend

```
backend/app/
├── schemas/    # Pydantic — validation/sérialisation
├── models/     # SQLAlchemy — persistance (12 entités)
├── crud/       # opérations base de données par entité (sans règle métier)
├── api/        # routers FastAPI scopés PartnerContext : auth, admin, partner_pos,
│                 partner_clients, partner_bts, partner_sim, partner_primes,
│                 partner_requests, imports, analytics
├── services/   # logique métier : pos_service, prime_service,
│                 prime_calculation_service, bts_service, sim_service,
│                 requete_service, import_validation_service,
│                 analytics_service, audit_service
└── security/   # jwt.py, password.py, permissions.py, login_guard.py
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

## Roadmap Backend — 14 jours (à jour : version finale Jour 14, tout est livré)

### Semaine 1

- [X] **Jour 1** — Initialisation FastAPI, config, connexion SQLAlchemy (SQLite local / MySQL prod).
- [X] **Jour 2** — Modèles SQLAlchemy des 12 tables + migrations Alembic.
- [X] **Jour 3** — `POST /api/auth/login` (JWT access + refresh), middleware, 4 rôles,
  révocation/rotation de jetons, anti-brute-force ; création de compte réservée
  à l'ADMIN (`POST /api/auth/users`).
- [X] **Jour 4 (matin)** — Administration Partenaires : `GET/POST /api/admin/partners`.
- [X] **Jour 4 (après-midi)** — Administration DSM : `GET/POST /api/admin/dsm`.
- [X] **Jour 5 (matin)** — BTS : `GET/POST /api/partners/{id}/bts`, unicité de code en base.
- [X] **Jour 5 (après-midi, P1)** — Relevés BTS : `GET/POST /api/partners/{id}/bts/{bts_id}/releves`.

### Jours 6-7 — Tampon / rattrapage (non obligatoire)

### Semaine 2

- [X] **Jour 8 (matin)** — `POST/GET /api/partners/{id}/pos` avec `dsm_id`,
  `type_pos = NOUVEAU` auto, contrôle du rattachement DSM, unicité de `code_pos` en base.
- [X] **Jour 8 (après-midi)** — `GET /api/partners/{id}/pos` avec filtres avancés
  (dont `type_pos` et `status`), `PATCH /api/partners/{id}/pos/{pos_id}`.
- [X] **Jour 9 (matin)** — `POST /api/partners/{id}/pos/{pos_id}/reconduction`
  (bascule irréversible RECONDUIT, historise dans `reconductions`, MAJ date_expiration)
  + `GET /api/partners/{id}/pos/{pos_id}/reconductions` (historique exposé).
- [X] **Jour 9 (après-midi)** — Module Primes : `POST /api/partners/{id}/primes/calculate`
  (validation stricte : POS NOUVEAU, période OPEN, une seule prime par POS),
  `PATCH /api/partners/{id}/primes/{prime_id}/status` (ADMIN).
- [X] **Jour 10 (matin)** — CRUD `/api/partners/{id}/clients` rattaché à un POS.
- [X] **Jour 10 (après-midi, P1)** — SIM : CRUD `/api/partners/{id}/sim` + mouvements
  de stock complets (réception, vente, activation, retour, perte) + assignation Client.
- [X] **Jour 11 (matin, P1)** — CRUD `/api/partners/{id}/requests` (rattachement
  multi-entités POS/BTS/CLIENT/PARTNER vérifié dans le PartnerContext).
- [X] **Jour 11 (après-midi)** — `import_validation_service.py` (validation NaN-safe
  + application transactionnelle), endpoints `/api/partners/{id}/imports/*` sur les
  **10 gabarits** exigés (PARTNER, DSM, POS, CLIENT, BTS, BTS_RELEVE, SIM,
  PRIME_PERIOD, PRIME, REQUETE).
- [X] **Jour 12 (matin)** — Endpoints `/api/partners/{id}/analytics/*` (dashboard,
  pos-performance, commissions), optimisés sans N+1 (test de non-régression),
  alertes d'expiration POS et seuil de saturation BTS.
- [X] **Jour 12 (après-midi)** — Journalisation automatique dans `AUDIT_LOGS` sur
  toutes les opérations sensibles (`audit_service.log_action`).
- [X] **Jour 13 (matin)** — Tests pytest ciblés Nouveau/Reconduit + Primes + SIM
  + performance (55 tests, couverture globale 91 %).
- [X] **Jour 13 (après-midi)** — UAT : scénario de recette de référence complet,
  sans erreur (automatisé dans la suite pytest).
- [X] **Jour 14** — Déploiement local final : `scripts/seed.py` (jeu de démo),
  guide de lancement, Dockerfile multi-étapes + docker-compose rédigés
  (non exécutés faute de démon Docker dans l'environnement de rédaction).

## Endpoints de référence (contrat à respecter — version finale, routes scopées PartnerContext)

Toute route métier passe par `get_partner_context` (`app/api/deps.py`) : un
utilisateur ne peut accéder qu'aux Partenaires de son périmètre (403 sinon).

| Méthode | Endpoint | Accès |
|---|---|---|
| POST | `/api/partners/{id}/pos/{pos_id}/reconduction` | Tous rôles authentifiés du Partenaire |
| GET | `/api/partners/{id}/pos/{pos_id}/reconductions` | Tous rôles authentifiés du Partenaire |
| POST | `/api/partners/{id}/primes/calculate` | ADMIN, PARTENAIRE (rejet si POS ≠ NOUVEAU ou période non OPEN) |
| PATCH | `/api/partners/{id}/primes/{prime_id}/status` | ADMIN (validation finale) |
| POST | `/api/partners/{id}/bts/{bts_id}/releves` | Tous rôles authentifiés du Partenaire |
| POST | `/api/partners/{id}/sim/{sim_id}/movements` | Tous rôles authentifiés du Partenaire (vente = `movement_type: VENTE`) |
| POST | `/api/partners/{id}/requests` | Tous rôles authentifiés |
| POST | `/api/auth/login` · `/api/auth/refresh` · `/api/auth/logout` | Public (JWT, révocation) |
| GET | `/api/partners/{id}/analytics/dashboard` | Tous rôles authentifiés du Partenaire |
| POST | `/api/partners/{id}/imports/validate` + `/imports/{batch_id}/apply` | Rôles autorisés (`IMPORT_ROLES`) |
| GET/POST | `/api/admin/partners` · `/api/admin/dsm` | ADMIN (DSM : ADMIN ou PARTENAIRE) |
| GET/POST/PATCH | `/api/auth/users` | ADMIN |

## Commandes utiles

```bash
# Lancer l'API en local
cd backend && python main.py        # http://localhost:8000
# Doc interactive
# http://localhost:8000/docs
# Tests
python -m pytest --cov=app
```

## Ce que Gemini ne doit jamais faire

- Ne pas cocher une case de la roadmap tout seul — c'est à l'équipe de le faire une fois le livrable du jour validé en sync 17h30.
- Ne pas proposer de contourner la contrainte d'unicité Prime/POS ou la règle Nouveau/Reconduit, même "pour aller plus vite" en démo.
- La base est SQLite pour ce projet (décision de l'équipe Backend) —
  le cahier des charges v3.1 prévoyait MySQL ; ne pas "corriger" ce
  choix tout seul, mais rappeler l'écart si le sujet des accès
  concurrents multi-agences revient en discussion.
