# POSTrack — Backend (version finale complète, Jour 14)

API REST de la plateforme **POSTrack**, qui gère et suit la chaîne
**Partenaire → DSM → POS → Client**, ainsi que les BTS, le stock SIM,
les Primes par période, les Requêtes multi-entités et l'import Excel
central. Cette version implémente le cahier des charges **v3.1-R7** /
l'architecture technique **v3.1-R7** / la roadmap **v3.3-R7** livrés à
partir du jour 7, jusqu'au jour 14 (déploiement et présentation finale).

---

## 1. Vue d'ensemble fonctionnelle

Toute consultation ou opération métier s'effectue **dans le contexte
d'un Partenaire sélectionné** (`PartnerContext`). Ce principe est
appliqué à trois niveaux : la route API, le service métier, et la
donnée elle-même — jamais uniquement côté frontend.

```
Login (JWT)
  ↓
Sélection Partenaire (GET /api/auth/partenaires/available)
  ↓
Dashboard Partenaire (GET /api/partners/{id}/analytics/dashboard)
  ↓
Modules : POS, BTS, Clients, SIM, Primes, Requêtes, Import Excel
```

### Rôles applicatifs

| Rôle | Périmètre | Peut notamment |
|---|---|---|
| `ADMIN` | Tous les Partenaires | Gérer utilisateurs/Partenaires/DSM, consulter l'audit, **valider les primes** |
| `PARTENAIRE` (Représentant Partenaire) | Portefeuille de Partenaires affecté | Gérer POS/Clients/SIM/BTS/Requêtes/Primes de son périmètre, lancer les imports |
| `DSM` (Représentant DSM) | Zone DSM et POS rattachés | Suivre/mettre à jour les données de sa zone, saisir des relevés BTS |
| `POS_HOLDER` (Détenteur POS) | Un ou plusieurs POS autorisés | Gérer Clients/SIM locaux, créer des Requêtes |

Le mapping technique `PARTENAIRE / DSM / POS_HOLDER / ADMIN` correspond
aux libellés métier `Représentant Partenaire / Représentant DSM /
Détenteur POS / Admin` du cahier des charges ; seuls les anciens
libellés `MANAGER` / `VIEWER` sont abandonnés.

### Règles métier clés implémentées

- **POS** : créé avec `type_pos = NOUVEAU` ; unicité du `code_pos` dans
  le Partenaire ; le DSM référencé doit appartenir au même Partenaire.
- **Reconduction** : bascule **irréversible** `NOUVEAU → RECONDUIT` ;
  rejetée si le POS est déjà `RECONDUIT` ou si la nouvelle date
  d'expiration n'est pas postérieure à l'ancienne.
- **Primes** : `prime_calculation_service` ne retient que les POS
  `NOUVEAU` sans prime existante d'une `PrimePeriod` **OPEN** ; une
  seule prime par POS (contrainte d'unicité en base) ; la validation
  finale (`VALIDEE`) est réservée à l'`ADMIN` ; un POS `RECONDUIT` ne
  peut plus recevoir de prime de création.
- **DSMCommission** : calculée en parallèle du calcul de primes, pour
  chaque DSM ayant au moins un POS éligible sur la période.
- **Requêtes multi-entités** : chaque entité rattachée (POS, BTS,
  Client, Partenaire) est vérifiée comme appartenant au
  `PartnerContext` courant avant création.
- **Import Excel** : `import_validation_service` contrôle le gabarit,
  produit une prévisualisation et un rapport d'erreurs localisé
  (ligne/colonne), puis `ImportBatch` trace le lot (voir limite au
  §5.2).
- **Audit** : toute opération sensible (création POS, reconduction,
  primes, imports, requêtes...) écrit une entrée dans `AUDIT_LOGS` via
  `audit_service`.

Le **scénario métier de démonstration** (jour 14) est directement
vérifiable : connexion → sélection Partenaire → création d'un POS →
calcul d'une prime → validation par l'ADMIN → reconduction du POS →
nouveau calcul de primes qui ne produit plus rien pour ce POS.

---

## 2. Stack technique

| Couche | Technologie |
|---|---|
| API | FastAPI |
| Persistance | SQLAlchemy 2.x |
| Base de données | MySQL (production) — **SQLite en local/démo, aucune installation requise** |
| Authentification | JWT (access + refresh) et bcrypt |
| Import Excel | Pandas + OpenPyXL |
| Frontend attendu | React / Vite (hors périmètre de ce dépôt) |

Le projet utilise `DATABASE_URL` pour choisir la base : par défaut
`sqlite:///./postrack.db` (zéro configuration), et
`mysql+pymysql://user:password@host:3306/postrack` en production (voir
`.env.example`).

---

## 3. Structure du projet

```
postrack-backend/
├── requirements.txt
├── .env.example
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── alembic.ini
├── pytest.ini
├── README.md
├── ROADMAP.md
├── migrations/                   # migrations Alembic versionnées
│   ├── env.py
│   └── versions/
│       └── ..._schema_initial_postrack_v4_0.py
├── tests/                         # suite pytest (55 tests, 91% de couverture)
│   ├── conftest.py
│   ├── test_partner_context.py
│   ├── test_pos_reconduction.py
│   ├── test_primes.py
│   ├── test_imports.py
│   ├── test_requetes.py
│   ├── test_bts_and_permissions.py
│   ├── test_gap_closure.py
│   ├── test_performance.py
│   └── test_sim.py
├── scripts/
│   └── seed.py                  # jeu de données de démonstration (jour 14)
└── app/
    ├── main.py                  # point d'entrée FastAPI
    ├── core/
    │   ├── config.py            # variables d'environnement centralisées
    │   ├── database.py          # moteur SQLAlchemy + session
    │   └── errors.py            # exceptions métier -> réponses HTTP
    ├── security/
    │   ├── jwt.py                # émission / décodage des jetons
    │   ├── password.py           # hachage bcrypt
    │   └── permissions.py        # rôles applicatifs et matrices d'accès
    ├── models/                   # entités SQLAlchemy (une par fichier)
    ├── schemas/                  # DTO Pydantic (entrée / sortie API)
    ├── crud/                     # persistance simple, sans règle métier
    ├── services/                 # règles métier (le "cœur" de l'appli)
    │   ├── pos_service.py
    │   ├── prime_service.py
    │   ├── prime_calculation_service.py
    │   ├── bts_service.py
    │   ├── sim_service.py
    │   ├── requete_service.py
    │   ├── import_validation_service.py
    │   ├── analytics_service.py
    │   └── audit_service.py
    └── api/                       # routes FastAPI (orientées Partenaire)
        ├── deps.py                # JWT, rôle, PartnerContext
        ├── auth.py
        ├── partner_pos.py
        ├── partner_clients.py
        ├── partner_bts.py
        ├── partner_sim.py
        ├── partner_primes.py
        ├── partner_requests.py
        ├── imports.py
        ├── analytics.py
        └── admin.py
```

Cette organisation reprend directement la séparation **CRUD / services
métier / routes** décrite dans le document d'architecture technique
v3.1-R7 : un CRUD ne décide jamais d'une règle métier (éligibilité
d'une prime, transition Nouveau/Reconduit, validité d'un import...),
cela reste le rôle exclusif des `services`.

---

## 4. Installation et lancement

```bash
# 1. Créer un environnement virtuel (recommandé)
python3 -m venv venv
source venv/bin/activate

# 2. Installer les dépendances
pip install -r requirements.txt

# 3. Configurer l'environnement
cp .env.example .env
# Par défaut DATABASE_URL=sqlite:///./postrack.db : rien d'autre à faire.
# Pour MySQL, décommenter/adapter la ligne mysql+pymysql://... dans .env

# 4. Charger le jeu de données de démonstration
python -m scripts.seed

# 5. Lancer le serveur
uvicorn app.main:app --reload
```

L'API est alors disponible sur `http://localhost:8000`, avec la
documentation interactive (Swagger) sur `http://localhost:8000/docs`.

### Comptes de démonstration (créés par `scripts/seed.py`)

| Utilisateur | Mot de passe | Rôle |
|---|---|---|
| `admin` | `Admin@2026` | ADMIN |
| `rep.littoral` | `Partenaire@2026` | Représentant Partenaire (PART-001) |
| `dsm.awa` | `Dsm@2026` | Représentant DSM |
| `pos.douala01` | `Pos@2026` | Détenteur POS |

*(mots de passe de démonstration uniquement — à changer avant tout
déploiement réel)*

---

## 5. Points d'API principaux

### Authentification (hors contexte Partenaire)

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Connexion, retourne access + refresh token |
| POST | `/api/auth/refresh` | Renouvellement du token d'accès |
| GET | `/api/auth/me` | Profil de l'utilisateur connecté |
| GET | `/api/auth/partenaires/available` | Partenaires autorisés (page Sélection Partenaire) |
| POST | `/api/auth/users` | Création de compte (ADMIN uniquement) |

### Ressources orientées Partenaire (`/api/partners/{partner_id}/...`)

| Domaine | Routes indicatives |
|---|---|
| POS | `GET/POST /pos`, `GET/PATCH /pos/{id}`, `POST /pos/{id}/reconduction`, `GET /pos/{id}/reconductions` |
| Clients | `GET/POST /clients`, `GET/PATCH /clients/{id}` |
| BTS | `GET/POST /bts`, `GET /bts/{id}`, `GET/POST /bts/{id}/releves` |
| SIM | `GET/POST /sim`, `POST /sim/{id}/assign`, `PATCH /sim/{id}/status` |
| Primes | `GET /prime-periods`, `POST /prime-periods`, `PATCH /prime-periods/{id}/status`, `GET /primes`, `POST /primes/calculate`, `PATCH /primes/{id}/status`, `GET /primes/commissions` |
| Requêtes | `GET/POST /requests`, `GET /requests/{id}`, `PATCH /requests/{id}` |
| Import Excel | `POST /imports/validate` (multipart, champ `entity_type` + `file`), `POST /imports/{batch_id}/apply`, `GET /imports/{batch_id}` |
| Analytics | `GET /analytics/dashboard` |

### Administration (`/api/admin/...`, réservé ADMIN)

`GET/POST /partners`, `GET/POST /dsm`, `GET /audit`.

Chaque route ci-dessus dépend de `get_partner_context`
(`app/api/deps.py`) qui vérifie que l'utilisateur connecté a bien
accès au `partner_id` demandé — **avant** toute lecture ou écriture.
Un utilisateur ne peut jamais consulter les données d'un autre
Partenaire en modifiant l'identifiant dans l'URL (403 sinon).

### 5.1 Import Excel — 10 gabarits (couverture complète du §1.7.1)

Le cahier des charges exige explicitement (§1.7.1) que l'import couvre
*"au minimum : Partenaires, DSM, POS, Clients, BTS, relevés BTS, SIM,
périodes de primes, primes et requêtes"*. Les 10 gabarits
correspondants sont tous implémentés (`entity_type`) :

| `entity_type` | Colonnes obligatoires | Clé de rapprochement |
|---|---|---|
| `PARTNER` | `code_partenaire, name` | Le Partenaire de contexte lui-même (voir note ci-dessous) |
| `DSM` | `matricule, full_name` | `matricule` |
| `POS` | `code_pos, name, dsm_matricule, date_creation, date_expiration` | `code_pos` |
| `CLIENT` | `pos_code, full_name` | — (création) |
| `BTS` | `code_bts` | `code_bts` |
| `BTS_RELEVE` | `bts_code, charge, taux_saturation, rendement` | — (création d'un relevé horodaté) |
| `SIM` | `iccid, pos_code` | `iccid` |
| `PRIME_PERIOD` | `code, label, start_date, end_date` | `code` |
| `PRIME` | `pos_code, prime_period_code, montant` | `pos_id` (unicité) |
| `REQUETE` | `external_id, type_requete, titre` | `external_id` |

**Note sur `PARTNER`** : l'ensemble de l'API POSTrack est bâti autour
d'un `PartnerContext` obligatoire (aucune route n'existe hors d'un
`partner_id` déjà sélectionné). Importer "des Partenaires" depuis une
route déjà scopée à un `partner_id` ne peut donc pas créer de nouveaux
Partenaires sans casser ce principe de contexte obligatoire : ce
gabarit met à jour les champs (`name`, `address`) du Partenaire de
contexte lui-même, à condition que la ligne référence bien son propre
`code_partenaire` — toute autre valeur est rejetée. C'est un choix de
conception documenté, pas un oubli.

### 5.2 Application réelle du lot (`apply_import`)

`POST /imports/{batch_id}/apply` relit les lignes validées (stockées
lors de `validate_import` dans `import_reports/batch_{id}_valid_rows.json`,
référencées par `ImportBatch.valid_rows_path`) et les écrit en base
dans une **seule transaction SQLAlchemy** : soit tout le lot est
appliqué, soit rien ne l'est (rollback automatique + statut `FAILED`
en cas d'erreur inattendue, par exemple si une donnée référencée a
changé entre la validation et l'application). Testé de bout en bout
pour les 10 gabarits (`tests/test_imports.py`, `tests/test_gap_closure.py`).

### 5.3 Téléchargement du rapport d'erreurs

`GET /imports/{batch_id}/report` renvoie le rapport d'erreurs complet
(JSON) d'un lot donné, en téléchargement direct.

---

## 5.4 Mouvements de stock SIM et alertes du Dashboard

- `POST /sim/{sim_id}/movements` enregistre un mouvement
  (`RECEPTION`, `VENTE`, `ACTIVATION`, `RETOUR`, `PERTE`) et fait
  évoluer le statut de la SIM en conséquence (ex. `ACTIVATION`
  nécessite que la SIM soit déjà assignée). `GET
  .../movements` liste l'historique.
- Le Dashboard (`GET /analytics/dashboard`) inclut désormais
  `pos_expirations_proches` : les POS actifs dont l'échéance est à
  moins de `POS_EXPIRATION_ALERT_DAYS` jours (30 par défaut,
  configurable dans `.env`).

## 5.5 Pagination normalisée

Toutes les routes de liste (`GET` sur `pos`, `clients`, `bts`,
`bts/{id}/releves`, `sim`, `sim/{id}/movements`, `primes`, `requests`,
`imports`, `analytics/pos-performance`, `analytics/commissions`,
`auth/users`) renvoient désormais une enveloppe normalisée :

```json
{ "items": [...], "total": 42, "skip": 0, "limit": 100, "has_next": true }
```

## 5.6 Performances POS (`POSPerformance`)

Conforme à l'architecture technique §3.3.2/§6.3 : `POST
/analytics/pos-performance/calculate` (body : `period_start`,
`period_end`) recalcule, pour chaque POS du Partenaire, le nombre de
Clients rattachés et de SIM actives sur la période, et alimente la
table `POSPerformance` (`source=CALCUL`). `GET
/analytics/pos-performance` liste ensuite ces mesures (paginé,
filtrable par `pos_id`). Les sources `IMPORT` et `MANUEL` restent
disponibles pour une alimentation alternative (import Excel ou saisie
directe), conformément au modèle de données.

## 5.7 Gestion des utilisateurs (ADMIN)

En complément de `POST /api/auth/users` (création), l'ADMIN dispose
désormais de `GET /api/auth/users` (liste paginée, filtrable par
`role`/`is_active`) et `PATCH /api/auth/users/{id}` (activation,
désactivation, changement de rôle ou de rattachement DSM) —
conformément à la responsabilité "gérer les utilisateurs" du rôle
ADMIN (cahier des charges §1.5.3).

## 5.8 Déconnexion et révocation de jeton

`POST /api/auth/logout` révoque immédiatement le jeton d'accès en
cours (via son identifiant `jti`, stocké dans une table dédiée
`revoked_tokens`) : toute requête ultérieure avec ce même jeton est
rejetée (401), même s'il n'est pas encore expiré selon son horodatage.

## 6. Sécurité et contrôle d'accès

Trois niveaux de contrôle, comme l'exige la documentation
fonctionnelle :

1. **JWT** (`app/security/jwt.py`) identifie l'utilisateur sur chaque
   route protégée.
2. **Rôle** (`app/security/permissions.py`, dépendance `require_roles`)
   détermine les opérations permises.
3. **PartnerContext** (`app/api/deps.py`, dépendance
   `get_partner_context`) détermine le périmètre de données, y
   compris les cohérences indirectes (ex. un DSM référencé dans un POS
   doit appartenir au même Partenaire que ce POS).

---

## 7. Migrations de base de données (Alembic)

Le schéma est versionné avec Alembic (`migrations/`), configuré pour
lire `DATABASE_URL` directement depuis `app.core.config.settings`
(donc depuis `.env`) — une seule source de vérité pour la connexion.

```bash
# Appliquer toutes les migrations (cree le schema si la base est vide)
alembic upgrade head

# Revenir en arriere d'une revision
alembic downgrade -1

# Generer une nouvelle migration apres modification des modeles
alembic revision --autogenerate -m "description du changement"
```

Trois révisions sont fournies, générées automatiquement à partir des
modèles et **testées individuellement** (`upgrade head` → `downgrade`
→ `upgrade head` à nouveau, sans erreur) :

1. `..._schema_initial_postrack_v4_0.py` — schéma complet initial (17 tables)
2. `..._ajout_external_id_sur_requetes_et_table_.py` — ajoute
   `Requete.external_id` (clé de rapprochement pour l'import Excel des
   requêtes) et la table `revoked_tokens` (révocation de jeton / logout)
3. `..._renforcement_contraintes_unicite_et_.py` — ajoute les
   contraintes d'unicité `POS(partner_id, code_pos)` et
   `BTS(partner_id, code_bts)` au niveau base (jusque-là vérifiées
   uniquement côté application), ainsi que les index composites de
   performance (§10.1). Cette révision utilise le mode batch
   d'Alembic (`render_as_batch=True`, configuré dans
   `migrations/env.py`) car SQLite ne sait pas modifier une contrainte
   en place — sans effet sur MySQL, qui n'en a pas besoin.

En développement/démo avec SQLite, `app/main.py` conserve en plus un
appel à `Base.metadata.create_all()` au démarrage, pour un lancement
à zéro configuration (`uvicorn app.main:app --reload` fonctionne
directement sans étape Alembic manuelle). En production (MySQL), ce
`create_all()` devient un no-op inoffensif une fois les migrations
appliquées : **la pratique recommandée reste `alembic upgrade head`
avant le premier lancement.**

---

## 8. Tests automatisés

Suite pytest complète dans `tests/` (base SQLite dédiée et isolée,
recréée à chaque exécution — aucune interférence avec `postrack.db`) :

```bash
pip install -r requirements.txt   # pytest, pytest-cov et httpx sont inclus
pytest                            # ou : pytest --cov=app --cov-report=term-missing
```

**Résultat actuel : 55/55 tests passent, couverture globale 91 %**
(objectif de la roadmap Jour 13 : ≥ 70 % sur les modules critiques —
atteint et dépassé).

| Fichier | Couvre |
|---|---|
| `test_partner_context.py` | Isolation du PartnerContext : 403 sur un Partenaire non autorisé, accès ADMIN transversal, portée DSM, rejet sans jeton |
| `test_pos_reconduction.py` | `type_pos=NOUVEAU` à la création, unicité de `code_pos`, transition irréversible `NOUVEAU → RECONDUIT` (409 sur une 2e tentative) |
| `test_primes.py` | **Scénario critique complet** : calcul → validation réservée à l'ADMIN (403 sinon) → unicité de la prime par POS → blocage après reconduction → génération de la DSMCommission → filtres de liste par période/statut |
| `test_imports.py` | Rejet colonne manquante (422), rejet relation hors contexte (DSM inconnu), **application réelle transactionnelle** (le nombre de POS augmente bien après `/apply`), isolation par Partenaire (403) |
| `test_requetes.py` | Rattachement multi-entités accepté dans le contexte, rejeté hors contexte (422), suivi des transitions de statut |
| `test_bts_and_permissions.py` | Relevé BTS + alerte de saturation sur le Dashboard, rejet d'une valeur négative, permission ADMIN-only sur la création de Partenaire, unicité de `code_bts` |
| `test_gap_closure.py` | Import des 10 gabarits (création + mise à jour + chemins d'erreur), calcul et liste de `POSPerformance`, gestion des utilisateurs par l'ADMIN, révocation de jeton, **rotation du refresh token**, verrouillage anti-brute-force |
| `test_sim.py` | Création SIM, unicité ICCID, assignation (avec contrôle de cohérence POS), cycle complet des mouvements de stock (réception/vente/activation/retour) |
| `test_performance.py` | Non-régression N+1 : le nombre de requêtes SQL du Dashboard et du calcul de performance POS ne croît pas avec le volume de données |

Scénario métier critique vérifié automatiquement à chaque exécution de
la suite :

```
POS Nouveau créé → Prime calculée (EN_ATTENTE) → validation refusée
pour un Représentant Partenaire (403) → validée par l'ADMIN (VALIDEE)
→ nouveau calcul : aucune prime en double → Reconduction du POS
(RECONDUIT) → nouveau calcul de primes : aucune prime pour ce POS
(bloqué comme attendu).
```

---

## 10. Renforcement et optimisation (durcissement de production)

Passe dédiée à la performance, la sécurité et la robustesse, menée
après la conformité fonctionnelle :

### 10.1 Performance

- **Correction de deux N+1 réels** : le calcul `bts_saturees` du
  Dashboard exécutait une requête par BTS ; `calculate_pos_performance`
  exécutait un `db.refresh()` par POS. Les deux sont désormais en
  requêtes SQL agrégées (`GROUP BY`, sous-requête corrélée) et
  écritures en masse (`bulk_insert_mappings`/`bulk_update_mappings`) —
  **nombre de requêtes constant, indépendant du volume de données**.
  Test dédié (`tests/test_performance.py`) qui échoue si un N+1 est
  réintroduit (compte les requêtes SQL réellement émises).
- **Index composites** sur les filtres les plus fréquents :
  `POS(partner_id, type_pos)`, `POS(partner_id, status)`,
  `POS(partner_id, date_expiration)`, `SIM(partner_id, status)`,
  `SIM(partner_id, pos_id)`, `Requete(partner_id, statut)`,
  `Client(partner_id, pos_id)` — cohérent avec l'exigence du cahier
  des charges §11 (p95 < 500 ms sur un jeu de 10 000 POS).
- **Compression GZip** des réponses (`GZipMiddleware`, seuil 1 Ko).
- Dashboard mesuré entre 7 et 22 ms sur le jeu de démonstration (bien
  en-deçà du seuil de 500 ms), voir `tests/test_performance.py` pour
  la méthode de vérification en environnement de test.

### 10.2 Intégrité des données (bugs corrigés)

- `POS.code_pos` et `BTS.code_bts` n'étaient vérifiés qu'au niveau
  applicatif — une fenêtre de *race condition* permettait en théorie
  la création de deux POS/BTS avec le même code lors de requêtes
  concurrentes. Ajout de `UniqueConstraint` en base (§1.6.1 du cahier
  des charges) pour les deux.
- La route de création BTS n'avait **aucune** vérification de doublon
  (bug trouvé en écrivant les tests) — corrigée via un service dédié.
- **Bug de données trouvé par les tests** : une cellule Excel vide est
  relue par pandas comme `NaN` (flottant), pas comme une chaîne vide.
  L'ancienne validation (`str(row.get(champ, ""))`) transformait `NaN`
  en la chaîne `"nan"` — un champ obligatoire vide passait la
  validation, et un champ optionnel vide stockait littéralement le
  texte `"nan"` en base. Corrigé avec des helpers dédiés
  (`_is_blank`, `_clean_str`, `_clean_optional`) appliqués à tous les
  champs de tous les gabarits d'import.

### 10.3 Sécurité (bugs corrigés + durcissement)

- **Bug réel** : le refresh token n'était jamais vérifié contre la
  liste de révocation — après un `logout`, il restait valide jusqu'à
  7 jours. Corrigé, et **rotation du refresh token** ajoutée : chaque
  utilisation de `/auth/refresh` révoque l'ancien token et en émet un
  nouveau (limite la fenêtre d'exploitation d'un token volé/rejoué).
  `/auth/logout` peut désormais révoquer les deux tokens (access +
  refresh) en un seul appel.
- **Verrouillage anti-brute-force** sur `/auth/login` : 5 échecs
  consécutifs pour un même identifiant bloquent les tentatives
  suivantes pendant 5 minutes (`app/security/login_guard.py`).
- **CORS configurable** (`ALLOWED_ORIGINS` dans `.env`) plutôt qu'un
  `allow_origins=["*"]` figé — `allow_credentials` n'est jamais activé
  en combinaison avec un wildcard.

### 10.4 Robustesse et observabilité

- **Gestionnaire d'exceptions global** : toute exception non prévue
  renvoie désormais une réponse 500 générique (sans exposer la trace
  interne) tout en journalisant l'erreur complète côté serveur.
- **Logging structuré** avec un identifiant de requête (`X-Request-ID`
  en en-tête de réponse) et la durée de chaque appel, pour corréler
  les logs et surveiller en continu l'exigence de performance.

### 10.5 Docker (image de production)

- **Build multi-étapes** : l'étape de compilation (paquets système
  `build-essential`, headers MySQL) est séparée de l'image finale, qui
  ne contient que le résultat installé + le code — image plus légère,
  surface d'attaque réduite (pas de compilateur en production).
- **Utilisateur non-root** (`postrack`) dans le conteneur.
- **`HEALTHCHECK`** intégré (`/health`) pour que l'orchestrateur
  détecte un conteneur bloqué.
- `uvicorn --workers 2` pour exploiter plusieurs cœurs.

### 10.6 Tests

La suite est passée de 32 à **55 tests** (couverture globale : 91 %,
contre 86 % précédemment), avec un nouveau fichier dédié aux SIM
(`tests/test_sim.py`, quasiment non couvert auparavant) et aux
chemins d'erreur des nouveaux gabarits d'import
(`tests/test_gap_closure.py`), en plus du fichier de non-régression
performance (`tests/test_performance.py`).

---

## 11. Écarts identifiés et comblés (traçabilité de conformité)

Une revue de conformité au cahier des charges a identifié 5 écarts,
tous comblés et testés dans cette version :

| # | Écart identifié | Résolution |
|---|---|---|
| 1 | Import Excel limité à 3 gabarits sur les 10 minimum exigés (§1.7.1) | Étendu à 10 : `PARTNER, DSM, POS, CLIENT, BTS, BTS_RELEVE, SIM, PRIME_PERIOD, PRIME, REQUETE` — voir §5.1 |
| 2 | `POSPerformance` (architecture §3.3.2) créée en base mais jamais exposée | `POST/GET /analytics/pos-performance` — voir §5.6 |
| 3 | Route commissions à un chemin différent de l'architecture §6.3 | `GET /analytics/commissions` ajoutée (alias de `/primes/commissions`) |
| 4 | Gestion des utilisateurs (ADMIN) limitée à la création | `GET /auth/users`, `PATCH /auth/users/{id}` ajoutées — voir §5.7 |
| 5 | Pas de révocation de jeton / logout | `POST /auth/logout` + table `revoked_tokens` — voir §5.8 |

Chacun de ces points est couvert par au moins un test dans
`tests/test_gap_closure.py` (14 tests dédiés).

---

## 12. Déploiement avec Docker

Un `Dockerfile` (image de production, MySQL) et un
`docker-compose.yml` (API + MySQL, orchestration de démonstration)
sont fournis à la racine du projet :

```bash
docker compose up --build
# API disponible sur http://localhost:8000 (docs sur /docs)
# Les migrations Alembic sont appliquees automatiquement au demarrage
# du conteneur "api" (voir Dockerfile, CMD).

# Charger le jeu de donnees de demonstration une fois les conteneurs lances :
docker compose exec api python -m scripts.seed
```

> **Note d'honnêteté :** le `Dockerfile` et le `docker-compose.yml`
> ont été rédigés avec soin et leur syntaxe YAML a été validée, mais
> n'ont pas pu être testés par un lancement réel (`docker compose
> up`) dans cet environnement, qui ne dispose pas d'un démon Docker.
> Il est recommandé de faire un premier `docker compose up --build`
> de vérification avant tout déploiement réel, et de signaler tout
> ajustement nécessaire (au besoin sur le nom du service MySQL, les
> ports, ou les identifiants).

---

## 13. Hors périmètre (rappel du cahier des charges)

Comme précisé dans le cahier des charges v3.1-R7 : intégration à un
système financier externe pour le paiement réel des primes,
supervision réseau temps réel des BTS, réplication MySQL
multi-agences, 2FA/OAuth externe, ticketing avancé avec SLA
automatisés, gestion KYC, activation/portabilité SIM avancée.
