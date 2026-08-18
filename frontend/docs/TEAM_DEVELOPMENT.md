# POSTrack — Guide de répartition du développement Frontend (Version 3.1-R7)

## 1. Objectif du document

Ce document définit la répartition mise à jour des responsabilités entre les **trois développeurs de l'équipe Frontend** du projet **POSTrack**, conformément aux spécifications techniques et fonctionnelles de la **Version 3.1-R7**.

L'objectif est de permettre aux trois développeurs de travailler en parallèle tout en conservant :

* un fil conducteur unique basé sur le **contexte Partenaire (`partner_context_id`)** ;


* une responsabilité claire par module ;


* une architecture React + Vite et Axios cohérente ;


* une suppression stricte des CRUDs référentiels au profit d'un **système d'import Excel centralisé** ;


* des composants réutilisables et des contrats API REST homogènes sous le préfixe `/api/partners/{partner_id}/` ;


* une responsabilité complète de bout en bout sur chaque module Frontend.

### Architecture de navigation cible (R7)

```text
 ┌────────────────────────────────────────────────────────┐
 │                   POSTRACK FRONTEND                    │
 └───────────────────────────┬────────────────────────────┘
                             │
                        React + Vite
                             │
               1. Connexion / Login (JWT)[cite: 1, 3]
                             │
             2. Page de Sélection Partenaire[cite: 1, 3]
                             │
     3. PartnerContext Actif (partner_context_id)[cite: 1, 3]
                             │
            ┌────────────────┼────────────────┐
            │                │                │
      Lead Frontend    Frontend POS    Frontend Clients
            │                │                │
            ├─ Arch & Auth   ├─ POS           ├─ Clients
            ├─ PartnerContext├─ Reconduction  ├─ SIM & Stock
            ├─ Layout & Nav  ├─ Primes &      ├─ Requêtes
            ├─ Import Excel     Périodes      ├─ Dashboard /
            ├─ BTS & Relevés └─ Commissions      Analytics
            └─ Matrice Rôles    DSM

```

> **Important :** Toute la navigation et l'affichage des données métier dépendent impérativement du **`PartnerContext` actif**. Le changement de Partenaire réinitialise les filtres, le cache et les requêtes afin d'éviter tout mélange de données entre entités.
> 
> 

---

# 2. Organisation générale et Rôles applicatifs

L'équipe Frontend est composée de trois développeurs dont le périmètre s'aligne sur les quatre rôles métier applicatifs de la version 3.1-R7 : **ADMIN**, **Représentant Partenaire**, **Représentant DSM** et **Détenteur POS**.

| Développeur | Modules sous sa responsabilité | Rôles cibles à gérer côté UI |
| --- | --- | --- |
| **Développeur A — Lead Frontend** | Architecture, `PartnerContext`, Auth/JWT, Layout & Navigation, BTS & Relevés, **Import Excel centralisé**<br> | **ADMIN**, **Représentant Partenaire**<br> |
| **Développeur B — Frontend POS** | Gestion des POS, Cycle de vie Nouveau/Reconduit, Reconductions, Primes par Période (`PrimePeriod`), Commissions DSM (`DSMCommission`)

 | **Représentant Partenaire**, **Représentant DSM**, **Détenteur POS**<br> |
| **Développeur C — Frontend Clients & Ops** | Clients, Stock SIM & Mouvements, Requêtes multi-entités, Dashboard Partenaire & Analytics

 | **Représentant Partenaire**, **Représentant DSM**, **Détenteur POS**<br> |

---

# 3. Règles de développement communes

Pour chaque module, le développeur responsable suit le cycle de qualité :

```text
1. Vérifier le contrat API (/api/partners/{partner_id}/...)[cite: 2]
         ↓
2. Intégrer le PartnerContext obligatoire[cite: 1, 3]
         ↓
3. Concevoir la page / les composants sous UI Tailwind CSS[cite: 2]
         ↓
4. Créer / mettre à jour le service API dédié (partnerXxxService)[cite: 2]
         ↓
5. Implémenter la logique et la gestion d'états (loading, success, empty, error)
         ↓
6. Appliquer la matrice de droits du rôle connecté[cite: 1, 3]
         ↓
7. Écrire les tests unitaires/composants (Vitest + React Testing Library)
         ↓
8. Documenter, Pull Request et Code Review par le Lead
         ↓
9. Fusion dans develop

```

---

# 4. Développeur A — Lead Frontend

## Responsabilité générale

Le Lead Frontend est le garant des **fondations techniques, du `PartnerContext` applicatif, de l'Import Excel centralisé et du module BTS**.

```text
A — Lead Frontend
│
├── 1. Architecture React & Routing
├── 2. Authentification JWT & Matrice des 4 Rôles[cite: 1, 3]
├── 3. Sélection Partenaire & PartnerContext[cite: 1, 3]
├── 4. Layout, Navigation & Design System
├── 5. Import Excel Centralisé (ImportBatch)[cite: 1, 2, 3]
└── 6. BTS & Relevés d'indicateurs (Saturation/Rendement)[cite: 1, 3]

```

---

## 5. Module A1 — Architecture, Auth & PartnerContext

### Objectif

Sécuriser l'accès et imposer le passage par la **Sélection du Partenaire** avant d'accéder au Dashboard ou aux modules métier.

### Fonctionnalités & Implémentation

1. **Écran `/login**` : Authentification JWT (Access + Refresh Tokens).


2. **Écran `/select-partner**` : Affiche les Partenaires autorisés. Si un seul Partenaire est lié au rôle (ex: Représentant Partenaire), il peut être présélectionné.


3. **`PartnerContext` & `PartnerProvider**` :
* Conserve `partner_context_id`.


* Invalide les caches React Query / services lors d'un changement de Partenaire.


* Bloque tout appel API si aucun Partenaire n'est sélectionné.




4. **Services API & Intercepteurs Axios** : Préfixe automatique des requêtes par `/api/partners/{partner_id}/`.



---

## 6. Module A2 — Layout, Navigation & Matrice de Rôles

### Objectif

Offrir une interface responsive sous Tailwind CSS adaptative selon le rôle métier connecté.

### Composants & Rôles

* **Composants** : `MainLayout`, `PartnerSelectorBar`, `Sidebar`, `Header`, `RoleGuard`, `PageHeader`, `EmptyState`, `ErrorState`, `LoadingSpinner`.
* **Rôles supportés (3.1-R7)** :


* `ADMIN` : Accès transversal et administration système.


* `Représentant Partenaire` : Accès complet au portefeuille du Partenaire sélectionné.


* `Représentant DSM` : Restreint aux entités et POS de sa zone DSM.


* `Détenteur POS` : Restreint à ses POS spécifiques et opérations locales.





---

## 7. Module A3 — Import Excel Centralisé (`ImportBatch`)

### Objectif

Remplacer les anciens CRUDs référentiels autonomes (Partner, DSM, BTS, Clients) par le **canal central d'importation Excel en masse**.

### Frontend & Parcours Utilisateur

* **Page** : `/import-export` (ou modal dédiée).


* **Workflow en 5 étapes** :


1. *Téléchargement du Gabarit Excel officiel*.


2. *Sélection du type d'entité* (POS, Client, DSM, BTS, SIM, Performance, etc.).


3. *Dépôt de fichier & Validation* (`POST /api/partners/{id}/imports/validate`).


4. *Prévisualisation & Rapport d'erreurs* : Affichage du nombre de créations, mises à jour et erreurs par ligne/colonne.


5. *Confirmation/Commit* (`POST /api/partners/{id}/imports/{batch_id}/apply`).




* **Composants** : `ImportBatchTable`, `ImportPreviewModal`, `ErrorReportViewer`, `FileDropZone`.

---

## 8. Module A4 — BTS & Relevés de Performance

### Objectif

Suivre les équipements réseau rattachés au Partenaire et consigner les relevés horodatés.

### Frontend & Endpoints

* **Pages** : `/bts`, `/bts/:id`.


* **Endpoints** : `GET /api/partners/{id}/bts`, `GET /api/partners/{id}/bts/{bts_id}/performances`, `POST /api/partners/{id}/bts/{bts_id}/readings`.


* **Composants** :
* `SaturationGauge` : Indicateur visuel du taux de saturation de la BTS.


* `ReleveHistoryChart` : Graphique d'évolution de la charge et du rendement.


* `BTSReadingsForm` : Saisie ponctuelle d'un relevé d'indicateurs.





---

# 5. Développeur B — Frontend POS & Primes

## Responsabilité générale

Le Développeur B pilote la gestion du **cycle de vie complet d'un POS**, les **reconductions contractuelles**, ainsi que le calcul et la validation des **primes par période (`PrimePeriod`)** et des **commissions DSM (`DSMCommission`)**.

```text
B — Frontend POS & Primes
│
├── 1. Points de Vente (POS) & Rattachements[cite: 1, 3]
├── 2. Cycle de vie : Distinction NOUVEAU vs RECONDUIT[cite: 1, 3]
├── 3. Workflow de Reconduction historisé[cite: 1, 3]
├── 4. Primes par Période (PrimePeriod)[cite: 1, 2, 3]
└── 5. Commissions DSM (DSMCommission)[cite: 1, 2, 3]

```

---

## 9. Module B1 — Gestion des POS & Distinctions Cycle de Vie

### Objectif

Afficher et administrer le parc des points de vente du Partenaire courant.

### Frontend & Endpoints

* **Pages** : `/pos`, `/pos/new`, `/pos/:id`.


* **Endpoints** : `GET /api/partners/{id}/pos`, `POST /api/partners/{id}/pos`, `PATCH /api/partners/{id}/pos/{pos_id}`.


* **Règles visuelles** :
* Affichage obligatoire du badge de statut : `TypePosBadge` (`NOUVEAU` ou `RECONDUIT`).


* Affiche l'association au DSM, Partenaire et Détenteur POS.


* Un POS nouvellement créé via le formulaire ou l'import prend automatiquement le type `NOUVEAU`.





---

## 10. Module B2 — Workflow de Reconduction de POS

### Objectif

Permettre le renouvellement de la période d'exploitation d'un POS, basculant irréversiblement son statut à `RECONDUIT`.

### Frontend & Interdiction métier

* **Endpoint** : `POST /api/partners/{id}/pos/{pos_id}/reconduction`.


* **Workflow UI** :
1. Bouton "Reduire le POS" accessible uniquement sur les POS de type `NOUVEAU`.


2. Formulaire modal exigeant : nouvelle date d'expiration, motif, confirmation explicite.


3. L'API enregistre l'entrée dans `RECONDUCTIONS`, maj `date_derniere_reconduction` et bascule `type_pos` à `RECONDUIT`.




* **Composants** : `ReconductionModal`, `ReconductionHistoryTable`.

---

## 11. Module B3 — Primes par Période (`PrimePeriod`) & Commissions DSM (`DSMCommission`)

### Objectif

Gérer les dossiers de primes liées aux créations de POS et suivre la rétrocession/commission attribuée aux DSM.

### Workflow et Règle critique d'Éligibilité

* **Règle métier stricte** :
* POS `NOUVEAU` + Période de prime (`PrimePeriod`) `OPEN` $\rightarrow$ Eligible à la création de prime.


* POS `RECONDUIT` $\rightarrow$ **Exclusion définitive et blocage d'éligibilité à la prime de création**.





```text
       POS NOUVEAU                          POS RECONDUIT
            │                                     │
    PrimePeriod OPEN                      PrimePeriod OPEN
            │                                     │
    ┌───────┴───────┐                             │
    ▼               ▼                             ▼
Prime Eligible  DSMCommission              Prime Bloquée !
(Brouillon ->   (Calculée/              (Rejet explicite UI
 Validée)        Validée)                et API)[cite: 1, 3]

```

### Frontend & Endpoints

* **Pages** : `/primes`, `/primes/:id`.


* **Endpoints** : `GET /api/partners/{id}/primes`, `POST /api/partners/{id}/primes/calculate`, `POST /api/partners/{id}/primes/{prime_id}/validate`.


* **Statuts de la Prime** : `BROUILLON` $\rightarrow$ `EN_ATTENTE` $\rightarrow$ `VALIDEE` $\rightarrow$ `PAYEE` (ou `REJETEE`).


* **Composants** : `PrimeStatusBadge`, `PrimePeriodSelector`, `DSMCommissionTable`, `PrimeValidationModal`.

---

# 6. Développeur C — Frontend Clients, SIM, Requêtes & Analytics

## Responsabilité générale

Le Développeur C prend en charge le suivi du **fichier Client**, la gestion du **stock SIM**, le module de **Requêtes multi-entités** ainsi que le **Dashboard Partenaire et Analytics**.

```text
C — Frontend Clients & Operations
│
├── 1. Clients rattachés aux POS[cite: 1, 3]
├── 2. Stock SIM & Attribution (MSISDN / ICCID)[cite: 1, 3]
├── 3. Requêtes Multi-Entités (Incidents & Demandes)[cite: 1, 3]
└── 4. Dashboard Partenaire & Analytics Consolidées[cite: 1, 2, 3]

```

---

## 12. Module C1 — Gestion des Clients

### Objectif

Consulter et gérer les clients finaux enregistrés auprès des différents POS du Partenaire.

### Frontend & Endpoints

* **Pages** : `/clients`, `/clients/:id`.


* **Endpoints** : `GET /api/partners/{id}/clients`, `GET /api/partners/{id}/clients/{client_id}`, `PATCH /api/partners/{id}/clients/{client_id}`.


* **Fonctionnalités** : Recherche, filtres par POS, consultation de la fiche client et mises à jour autorisées. (L'alimentation massive est assurée par l'import Excel).



---

## 13. Module C2 — Stock SIM & Assignation Client

### Objectif

Piloter le stock des cartes SIM par POS et suivre leur statut d'attribution.

### Frontend & Statuts

* **Pages** : `/sims`, `/sims/stock`.


* **Statuts des SIM** : `EN_STOCK`, `VENDUE`, `ACTIVEE`, `DEFECTUEUSE`, `RETOURNEE`.


* **Fonctionnalités** :
* Recherche par ICCID / MSISDN.


* Filtrage par POS et par Client assigné.


* Consultation des mouvements et attribution à un client.




* **Composants** : `SimStockTable`, `SimStatusBadge`.

---

## 14. Module C3 — Requêtes Multi-Entités

### Objectif

Centraliser la gestion des demandes et incidents du terrain rattachés à une ou plusieurs entités (Partenaire, POS, BTS, Client).

### Frontend & Workflow

* **Pages** : `/requetes`, `/requetes/new`, `/requetes/:id`.


* **Endpoints** : `GET /api/partners/{id}/requests`, `POST /api/partners/{id}/requests`, `PATCH /api/partners/{id}/requests/{request_id}`.


* **Règle de validation** : Toutes les entités sélectionnées dans une même requête doivent appartenir obligatoirement au `PartnerContext` actif.


* **Statuts & Priorités** :
* *Statuts* : `OUVERTE` $\rightarrow$ `EN_COURS` $\rightarrow$ `EN_ATTENTE` $\rightarrow$ `RESOLUE` / `FERMEE`.


* *Priorités* : `BASSE`, `NORMALE`, `HAUTE`, `URGENTE`.




* **Composants** : `RequeteCard`, `PrioriteBadge`, `EntityMultiSelect`.

---

## 15. Module C4 — Dashboard Partenaire & Analytics Consolidées

### Objectif

Restituer le tableau de bord exécutif et synthétique du Partenaire actif dès le passage de l'écran de sélection.

### Frontend & Visualisations (Recharts)

* **Page** : `/dashboard`.


* **Endpoint** : `GET /api/partners/{id}/analytics/overview`.


* **Composants du Dashboard** :


* `StatCard` : Nombre de POS actifs, requêtes ouvertes, stock SIM global.


* `ChartNouveauVsReconduit` : Repartition visuelle du parc POS.


* `ChartPrimesPeriod` : Total des primes et commissions sur la période courante.


* `ChartBTSSaturation` : Alertes sur les BTS proches du seuil critique de saturation.





---

# 7. Matrice des Endpoints API Orientés Partenaire (v3.1-R7)

Toutes les routes métier consommées par l'équipe Frontend doivent être préfixées par `/api/partners/{partner_id}/`.

| Domaine | Méthode | Endpoint REST Target | Responsable Frontend |
| --- | --- | --- | --- |
| **Context** | `GET` | `/api/partenaires/available`<br> | Développeur A (Lead) |
| **Import** | `POST` | `/api/partners/{id}/imports/validate`<br> | Développeur A (Lead) |
| **Import** | `POST` | `/api/partners/{id}/imports/{batch_id}/apply`<br> | Développeur A (Lead) |
| **BTS** | `GET` / `POST` | `/api/partners/{id}/bts` & `/readings`<br> | Développeur A (Lead) |
| **POS** | `GET` / `POST` | `/api/partners/{id}/pos`<br> | Développeur B (POS) |
| **POS** | `POST` | `/api/partners/{id}/pos/{pos_id}/reconduction`<br> | Développeur B (POS) |
| **Primes** | `GET` / `POST` | `/api/partners/{id}/primes` & `/calculate`<br> | Développeur B (POS) |
| **Primes** | `POST` | `/api/partners/{id}/primes/{prime_id}/validate`<br> | Développeur B (POS) |
| **Clients** | `GET` / `PATCH` | `/api/partners/{id}/clients`<br> | Développeur C (Clients) |
| **SIM** | `GET` | `/api/partners/{id}/sims`<br> | Développeur C (Clients) |
| **Requêtes** | `GET` / `POST` | `/api/partners/{id}/requests`<br> | Développeur C (Clients) |
| **Analytics** | `GET` | `/api/partners/{id}/analytics/overview`<br> | Développeur C (Clients) |

---

# 8. Plan de Tests & Recette Frontend

Chaque développeur est responsable d'assurer la couverture de ses composants sous **Vitest + React Testing Library**.

### Scénario de Démonstration Critique (Validation de Recette) :

```text
1. Connexion / Login (JWT)[cite: 1, 3]
       ↓
2. Sélection du Partenaire X (PartnerContext)[cite: 1, 3]
       ↓
3. Affichage du Dashboard Partenaire[cite: 1, 3]
       ↓
4. Importation d'un lot Excel de POS (ImportBatch = APPLIED)[cite: 1, 2, 3]
       ↓
5. Création d'un POS (Type = NOUVEAU)[cite: 1, 3]
       ↓
6. Calcul / Attribution d'une Prime sur la période ouverte[cite: 1, 3]
       ↓
7. Executer la Reconduction du POS (Type bascule à RECONDUIT)[cite: 1, 3]
       ↓
8. Tentative de création d'une nouvelle Prime sur ce POS
       ↓
9. BLOQUAGE EXPLICITE (Message d'erreur métier refusé)[cite: 1, 3]

```

### Définition de « Module Terminé » :

* [ ] Contexte Partenaire (`partner_context_id`) vérifié et propagé.


* [ ] Endpoints REST sous préfixe `/api/partners/{id}/` consommés sans erreur.


* [ ] Rôles applicatifs (`ADMIN`, `Partenaire`, `DSM`, `POS`) contrôlés à l'affichage.


* [ ] Responsive design validé sous Desktop et Tablette.


* [ ] Couverture de tests unitaires/composants validée par CI.


* [ ] Pull Request relue et fusionnée dans `develop`.