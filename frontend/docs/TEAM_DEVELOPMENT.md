# POSTrack — Guide de répartition du développement Frontend

## 1. Objectif du document

Ce document définit la répartition des responsabilités entre les **trois développeurs de l'équipe Frontend** du projet **POSTrack**.

L'objectif est de permettre aux trois développeurs de travailler en parallèle tout en conservant :

* une responsabilité claire par module ;
* une architecture React cohérente ;
* une séparation propre des fonctionnalités ;
* une intégration progressive ;
* des composants réutilisables ;
* des contrats API homogènes ;
* une responsabilité complète sur chaque fonctionnalité Frontend.

L'équipe Frontend travaille sur une architecture :

```text
                    POSTRACK FRONTEND
                           │
                    React + Vite
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   Lead Frontend       Frontend POS      Frontend Clients
        │                  │                  │
        ├─ Architecture    ├─ POS             ├─ Clients
        ├─ Auth            ├─ Reconduction    ├─ Stock SIM
        ├─ Layout          ├─ Primes           ├─ Requêtes
        ├─ Partenaires     └─ Cycle de vie     ├─ Dashboard
        ├─ DSM                                  └─ Import/Export
        └─ BTS
```

L'architecture officielle du projet repose sur un client **React + Vite**, consommant l'API REST FastAPI via Axios, avec pages, composants, contextes/hooks et services. 

> **Important :** cette organisation est une séparation **fonctionnelle des modules Frontend**. Elle ne signifie pas que chaque développeur travaille dans un projet React séparé.

---

# 2. Organisation générale

L'équipe Frontend est composée de trois développeurs :

| Développeur                          | Responsabilité                                        |
| ------------------------------------ | ----------------------------------------------------- |
| **Développeur A — Lead Frontend**    | Architecture, fondations, Auth, Partenaires, DSM, BTS |
| **Développeur B — Frontend POS**     | POS, Nouveau/Reconduit, Reconductions, Primes         |
| **Développeur C — Frontend Clients** | Clients, SIM, Requêtes, Dashboard, Import/Export      |

Cette répartition correspond à l'organisation définie dans la roadmap POSTrack : le Lead Frontend porte l'architecture React, le routage, l'état global et les modules Partenaires/DSM/BTS ; le deuxième développeur porte le cycle de vie POS, les reconductions et les primes ; le troisième porte Clients, SIM, Requêtes, Dashboard et Import/Export. 

---

# 3. Règle de développement commune

Pour chaque fonctionnalité, le développeur responsable doit suivre le cycle :

```text
1. Comprendre le besoin fonctionnel
          ↓
2. Vérifier le contrat API
          ↓
3. Concevoir la page / les composants
          ↓
4. Créer les services API nécessaires
          ↓
5. Implémenter l'interface
          ↓
6. Gérer les états et erreurs
          ↓
7. Tester
          ↓
8. Documenter
          ↓
9. Pull Request
          ↓
10. Code Review
          ↓
11. Merge dans develop
```

Le développeur responsable doit être capable d'expliquer **l'ensemble du fonctionnement Frontend de son module**, et pas uniquement les composants graphiques.

---

# 4. Architecture Frontend commune

L'architecture de référence est organisée autour de :

```text
frontend/src/
│
├── pages/
│
├── components/
│
├── services/
│
├── hooks/
│
├── contexts/
│
├── routes/
│
└── ...
```

Les pages prévues dans l'architecture comprennent notamment Partenaires, DSM, BTS, POS, Reconduction, Primes, Clients, SIM, Requêtes, Analytics, Import/Export, Users et Audit Logs. 

Les composants spécialisés comprennent notamment :

```text
components/
├── POS/
├── Primes/
├── BTS/
├── Sims/
├── Requetes/
└── Dashboard/
```

avec des composants comme `TypePosBadge`, `PrimeStatusBadge`, `SaturationGauge`, `SimStockTable`, `PrioriteBadge` et `StatCard`. 

---

# 5. Développeur A — Lead Frontend

## Responsabilité générale

Le Lead Frontend est responsable des **fondations techniques et de l'architecture globale de l'application React**.

Il est également responsable des modules :

```text
A — Lead Frontend
│
├── 1. Architecture Frontend
├── 2. Authentification
├── 3. Layout & navigation
├── 4. Composants communs
├── 5. Partenaires
├── 6. DSM
└── 7. BTS
```

Son rôle n'est donc pas uniquement de développer des pages : il garantit que les trois développeurs produisent du code compatible et intégrable.

---

# 6. Module A1 — Architecture Frontend

## Objectif

Mettre en place la structure commune que les deux autres développeurs utiliseront.

## Responsabilités

Le Lead doit définir :

* structure des dossiers ;
* système de routage ;
* conventions de nommage ;
* gestion de l'état global ;
* système de services API ;
* composants communs ;
* gestion des erreurs ;
* gestion des états `loading`, `success`, `error` ;
* protection des routes ;
* conventions de formulaires ;
* conventions des tableaux ;
* conventions des modales.

Architecture cible :

```text
App
│
├── Router
│
├── AuthProvider
│
├── Layout
│
├── Protected Routes
│
└── Pages
```

---

# 7. Module A2 — Authentification

## Objectif

Permettre à l'utilisateur de se connecter et d'accéder uniquement aux fonctionnalités correspondant à son rôle.

POSTrack utilise quatre rôles :

```text
ADMIN
MANAGER
DSM
VIEWER
```

Le mécanisme prévu est basé sur JWT avec access token et refresh token. 

## Frontend

Créer notamment :

```text
/login
```

et les éléments nécessaires à la gestion de session.

Fonctionnalités :

* formulaire de connexion ;
* validation des champs ;
* affichage des erreurs ;
* stockage de session ;
* récupération de l'utilisateur connecté ;
* déconnexion ;
* expiration de session ;
* redirection après connexion ;
* protection des routes.

## Composants / services

Exemples :

```text
AuthContext
ProtectedRoute
RoleGuard
authService
Axios interceptor
```

## Tests

Tester notamment :

* connexion valide ;
* mauvais identifiant ;
* mauvais mot de passe ;
* token invalide ;
* session expirée ;
* déconnexion ;
* accès interdit selon le rôle.

---

# 8. Module A3 — Layout & Navigation

## Objectif

Créer la structure visuelle commune de POSTrack.

Créer notamment :

```text
MainLayout
Sidebar
Header
Breadcrumb
PageHeader
Notification
LoadingState
ErrorState
EmptyState
```

## Fonctionnalités

Le layout doit gérer :

* navigation principale ;
* affichage du profil connecté ;
* déconnexion ;
* navigation responsive ;
* affichage des éléments selon le rôle ;
* notifications ;
* titre de page ;
* état de chargement global si nécessaire.

Le Lead doit veiller à ce que les développeurs B et C **réutilisent ces composants plutôt que de recréer leur propre navigation**.

---

# 9. Module A4 — Composants communs

## Objectif

Créer les composants génériques nécessaires aux trois développeurs.

Exemples :

```text
components/
├── common/
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── Modal
│   ├── Table
│   ├── Badge
│   ├── Pagination
│   ├── SearchBar
│   ├── FilterBar
│   ├── ConfirmDialog
│   ├── LoadingSpinner
│   ├── EmptyState
│   └── ErrorMessage
```

## Règle

Avant de créer un composant générique, vérifier s'il existe déjà.

```text
Besoin
  ↓
Recherche composant existant
  ↓
Réutilisation
  ↓
Extension si nécessaire
  ↓
Création uniquement si nécessaire
```

---

# 10. Module A5 — Partenaires

## Objectif

Permettre la consultation et la gestion des partenaires.

## Frontend

Créer :

```text
/partenaires
/partenaires/:id
/partenaires/new
/partenaires/:id/edit
```

Fonctionnalités :

* liste ;
* recherche ;
* filtrage ;
* création ;
* modification ;
* détail ;
* statut ;
* informations associées.

Les partenaires constituent le niveau supérieur de la chaîne :

```text
Partenaire
    ↓
DSM
    ↓
POS
```

## Composants

```text
PartenaireTable
PartenaireForm
PartenaireStatusBadge
```

## Service

```text
partenaireService
```

---

# 11. Module A6 — DSM

## Objectif

Gérer les DSM et leur zone de couverture.

## Frontend

Créer :

```text
/dsm
/dsm/new
/dsm/:id
/dsm/:id/edit
```

Fonctionnalités :

* liste des DSM ;
* recherche ;
* création ;
* modification ;
* statut ;
* matricule ;
* nom complet ;
* zone de couverture ;
* partenaire associé.

La zone de couverture est particulièrement importante car le rôle DSM est limité aux entités rattachées à ses propres POS. 

---

# 12. Module A7 — BTS

## Objectif

Gérer les BTS et leur suivi.

## Frontend

Créer :

```text
/bts
/bts/new
/bts/:id
/bts/:id/edit
```

La fiche BTS doit notamment permettre d'afficher l'historique des relevés.

## Fonctionnalités

* liste des BTS ;
* recherche ;
* filtrage ;
* création ;
* modification ;
* détail ;
* partenaire associé ;
* statut ;
* historique des relevés ;
* saturation ;
* rendement.

## Composants

```text
BTSForm
SaturationGauge
ReleveHistoryChart
```

Ces composants font partie de l'architecture Frontend de référence. 

---

# 13. Développeur B — Frontend POS

## Responsabilité générale

Le développeur B est responsable de tout le **cycle de vie Frontend d'un POS**.

Ses modules sont :

```text
B — Frontend POS
│
├── 1. POS
├── 2. Nouveau / Reconduit
├── 3. Reconductions
└── 4. Primes
```

Il est le responsable principal de la restitution visuelle de la règle métier **NOUVEAU / RECONDUIT** et de son interaction avec le module Primes. 

---

# 14. Module B1 — Gestion des POS

## Objectif

Permettre de consulter et gérer les points de vente.

## Frontend

Créer :

```text
/pos
/pos/new
/pos/:id
/pos/:id/edit
```

## Fonctionnalités

* liste des POS ;
* recherche ;
* filtrage ;
* pagination ;
* création ;
* modification ;
* détail ;
* statut ;
* Partenaire associé ;
* DSM associé ;
* type POS ;
* date d'expiration.

Le type du POS doit être clairement visible :

```text
NOUVEAU
RECONDUIT
```

Le backend prévoit notamment un filtre `type_pos` sur la liste des POS. 

---

# 15. Module B2 — Distinction Nouveau / Reconduit

## Objectif

Rendre visuellement évidente la situation d'un POS.

Les deux valeurs sont :

```text
TYPE_POS
├── NOUVEAU
└── RECONDUIT
```



## Frontend

Créer notamment :

```text
TypePosBadge
```

Exemple conceptuel :

```text
POS-001
Type : NOUVEAU
```

ou :

```text
POS-001
Type : RECONDUIT
```

## Règle importante

Le Frontend ne doit pas décider lui-même qu'un POS est reconduit.

Il doit afficher l'état fourni par l'API.

```text
API
 ↓
type_pos
 ↓
TypePosBadge
```

Le changement de type est réalisé par le workflow de reconduction côté Backend.

---

# 16. Module B3 — Reconductions

## Objectif

Permettre d'enregistrer une reconduction d'un POS et d'en afficher l'historique.

## Frontend

Créer :

```text
/pos/:id/reconduction
```

ou une page équivalente selon le routage retenu.

## Fonctionnalités

* affichage du POS ;
* affichage de son statut actuel ;
* formulaire de reconduction ;
* confirmation explicite ;
* affichage de la date ;
* affichage de l'historique ;
* feedback de succès/erreur.

Le parcours prévu est :

```text
POS NOUVEAU
      ↓
Reconduction
      ↓
POS RECONDUIT
      ↓
Historique conservé
```

Le endpoint prévu est :

```text
POST /api/pos/{id}/reconduction
```

avec un endpoint de consultation de l'historique. 

---

# 17. Module B4 — Primes

## Objectif

Permettre le suivi visuel des primes associées aux POS.

Les statuts métier sont :

```text
EN_ATTENTE
VALIDEE
PAYEE
REJETEE
```



## Frontend

Créer :

```text
/primes
/primes/:id
```

et les composants :

```text
PrimeStatusBadge
PrimeForm
```

## Fonctionnalités

* liste des primes ;
* recherche ;
* filtrage ;
* détail ;
* création si autorisée ;
* validation ;
* affichage du statut ;
* suivi du paiement ;
* affichage du POS concerné ;
* affichage du DSM / Partenaire si disponible.

## Règle métier critique

Une prime est liée à un POS de type **NOUVEAU**.

Le Frontend doit donc :

```text
POS
 ↓
type_pos = NOUVEAU
 ↓
Prime disponible
```

et :

```text
POS
 ↓
type_pos = RECONDUIT
 ↓
Prime non éligible
```

La validation définitive de cette règle appartient à l'API. Le Frontend ne doit jamais considérer son propre contrôle comme une garantie de sécurité.

L'API prévoit notamment le rejet d'une création de prime lorsque le POS n'est pas de type `NOUVEAU`. 

---

# 18. Développeur C — Frontend Clients

## Responsabilité générale

Le développeur C est responsable de la partie **Client et exploitation opérationnelle associée**.

Ses modules sont :

```text
C — Frontend Clients
│
├── 1. Clients
├── 2. Stock SIM
├── 3. Requêtes
├── 4. Dashboard
└── 5. Import / Export
```

Cette répartition correspond au périmètre prévu pour le troisième développeur Frontend. 

---

# 19. Module C1 — Clients

## Objectif

Gérer les clients rattachés aux POS.

## Frontend

Créer :

```text
/clients
/clients/new
/clients/:id
/clients/:id/edit
```

## Fonctionnalités

* liste ;
* recherche ;
* filtrage ;
* création ;
* modification ;
* détail ;
* POS associé ;
* informations du client.

La relation fonctionnelle est :

```text
Partenaire
    ↓
DSM
    ↓
POS
    ↓
Client
```

Le Client est une entité enregistrée au niveau d'un POS. 

---

# 20. Module C2 — Stock SIM

## Objectif

Afficher le stock simplifié des SIM et leur état.

Le MVP prévoit un suivi simplifié des SIM par statut, POS et Client. 

## Frontend

Créer :

```text
/sims
/sims/stock
```

ou le routage équivalent.

## Fonctionnalités

* liste des SIM ;
* recherche ;
* filtrage ;
* POS associé ;
* Client associé ;
* statut ;
* ICCID ;
* MSISDN ;
* consultation du stock.

Les statuts prévus sont :

```text
EN_STOCK
VENDUE
ACTIVEE
DEFECTUEUSE
RETOURNEE
```



## Composants

```text
SimStatusBadge
SimStockTable
```

---

# 21. Module C3 — Requêtes

## Objectif

Permettre de consulter et suivre les demandes/incidents remontés du terrain.

## Frontend

Créer :

```text
/requetes
/requetes/new
/requetes/:id
```

## Fonctionnalités

* liste ;
* recherche ;
* filtrage ;
* création ;
* détail ;
* statut ;
* priorité ;
* type ;
* entité associée.

Les statuts sont :

```text
OUVERTE
EN_COURS
RESOLUE
FERMEE
```

Les priorités :

```text
BASSE
NORMALE
HAUTE
URGENTE
```

Les types comprennent notamment :

```text
APPROVISIONNEMENT_SIM
MAINTENANCE_BTS
RECLAMATION_CLIENT
SUPPORT_POS
AUTRE
```



## Composants

```text
RequeteCard
PrioriteBadge
```

---

# 22. Module C4 — Dashboard

## Objectif

Présenter une vue synthétique des indicateurs POSTrack.

Le dashboard fait partie des fonctionnalités P1 du MVP. 

## Frontend

Créer :

```text
/dashboard
```

ou :

```text
/analytics
```

selon la convention finalement retenue.

## Afficher notamment

* nombre de POS ;
* répartition Nouveau / Reconduit ;
* primes ;
* saturation BTS ;
* stock SIM ;
* requêtes ;
* autres indicateurs disponibles via l'API.

## Composants

```text
StatCard
ChartNouveauVsReconduit
ChartBTSSaturation
```

L'architecture prévoit explicitement ces composants de Dashboard. 

---

# 23. Module C5 — Import / Export

## Objectif

Permettre l'import et l'export des données prévues par le système.

L'import/export massif des POS est une fonctionnalité P1 du MVP. 

## Frontend

Créer :

```text
/import-export
```

Fonctionnalités :

* sélection du fichier ;
* contrôle du type de fichier ;
* envoi ;
* affichage de la progression si disponible ;
* résultat de l'import ;
* erreurs ;
* téléchargement de l'export.

Le Frontend ne doit pas reproduire la logique de traitement Excel du Backend.

---

# 24. Travail transversal — Design System

Le Design System est commun aux trois développeurs.

Il doit notamment définir :

```text
Couleurs
Typographie
Espacements
Boutons
Inputs
Tables
Badges
Modales
Cards
Alertes
États de chargement
États d'erreur
```

Les trois développeurs doivent utiliser les mêmes composants.

Il est interdit de créer trois variantes différentes d'un même composant sans justification.

---

# 25. Travail transversal — API Services

Les appels API doivent être centralisés dans les services Frontend.

Exemple :

```text
services/
├── authService
├── partenaireService
├── dsmService
├── btsService
├── posService
├── primeService
├── clientService
├── simService
└── requeteService
```

L'architecture officielle prévoit déjà des services spécialisés pour POS, primes, BTS, SIM, requêtes et clients. 

Une page ne doit pas contenir directement des appels Axios dispersés partout.

À éviter :

```text
Page
 └── axios.get(...)
```

Préférer :

```text
Page
 ↓
Service
 ↓
API
```

---

# 26. Travail transversal — Contrats API

Avant de développer une fonctionnalité dépendante du Backend, le développeur Frontend doit connaître :

```text
Méthode HTTP
URL
Paramètres
Query parameters
Body
Réponse
Codes HTTP
Erreurs
Permissions
```

Exemple :

```text
GET /api/pos

Query:
type_pos=NOUVEAU

Response:
{
    ...
}
```

Le Frontend ne doit pas inventer une structure de réponse différente de celle définie par l'API.

---

# 27. Travail transversal — Gestion des rôles

Le Frontend doit adapter l'interface au rôle connecté.

Les rôles sont :

```text
ADMIN
MANAGER
DSM
VIEWER
```

Leurs périmètres sont définis par le système de permissions POSTrack. 

Exemple :

```text
ADMIN
 └── Accès complet

MANAGER
 └── Gestion opérationnelle

DSM
 └── Données de sa zone

VIEWER
 └── Lecture seule
```

## Règle importante

Le Frontend peut masquer une action interdite :

```text
Bouton "Modifier"
       ↓
Permission absente
       ↓
Bouton masqué
```

Mais cela ne remplace jamais le contrôle Backend.

---

# 28. Travail transversal — États d'interface

Toutes les pages doivent gérer au minimum :

```text
LOADING
SUCCESS
EMPTY
ERROR
```

Exemple :

```text
Chargement
    ↓
API
    │
    ├── Succès → afficher les données
    │
    ├── Vide   → EmptyState
    │
    └── Erreur → ErrorState
```

L'ergonomie du MVP exige notamment un retour visuel systématique lors des actions : chargement, succès et erreur. 

---

# 29. Travail transversal — Responsive Design

L'application doit être conçue pour :

```text
Desktop
Tablette
```

Le responsive fait partie des exigences non fonctionnelles du projet. 

Les développeurs doivent donc éviter :

* largeurs fixes inutiles ;
* tableaux impossibles à consulter sur tablette ;
* formulaires débordants ;
* navigation non responsive.

---

# 30. Travail transversal — Tests Frontend

L'outil de référence prévu pour les tests Frontend est :

```text
Vitest
+
React Testing Library
```

Les composants critiques explicitement identifiés comprennent notamment :

```text
POSForm
ReconductionPage
PrimeForm
SimsStockPage
```



## Développeur A

Tester notamment :

```text
Login
ProtectedRoute
AuthContext
Layout
PartenaireForm
DSMForm
BTSForm
```

## Développeur B

Tester notamment :

```text
POSForm
TypePosBadge
FilterBar
ReconductionPage
PrimeForm
PrimeStatusBadge
```

## Développeur C

Tester notamment :

```text
ClientForm
SimStockTable
SimStatusBadge
RequeteForm
RequeteCard
Dashboard
ImportExport
```

---

# 31. Travail transversal — Intégration

Chaque développeur doit régulièrement synchroniser sa branche avec `develop`.

```text
feature
   ↓
développement
   ↓
tests
   ↓
synchronisation develop
   ↓
résolution éventuelle des conflits
   ↓
Pull Request
```

Il ne faut pas attendre la fin du projet pour intégrer les modules.

---

# 32. Ce que chaque développeur doit livrer

## Développeur A — Lead Frontend

```text
✓ Architecture React
✓ Routage
✓ Authentification
✓ Gestion des rôles côté UI
✓ Layout
✓ Navigation
✓ Composants communs
✓ Partenaires
✓ DSM
✓ BTS
✓ Services API correspondants
✓ Tests
✓ Documentation
```

## Développeur B — Frontend POS

```text
✓ POS
✓ Distinction Nouveau / Reconduit
✓ Reconduction
✓ Primes
✓ Composants POS
✓ Composants Primes
✓ Services API correspondants
✓ Tests
✓ Documentation
```

## Développeur C — Frontend Clients

```text
✓ Clients
✓ Stock SIM
✓ Requêtes
✓ Dashboard
✓ Import / Export
✓ Composants Clients/SIM/Requêtes/Dashboard
✓ Services API correspondants
✓ Tests
✓ Documentation
```

---

# 33. Définition de « module terminé »

Un module Frontend n'est considéré comme terminé que lorsque :

```text
[ ] Pages créées
[ ] Routage configuré
[ ] Composants nécessaires créés
[ ] Services API créés
[ ] Contrat API respecté
[ ] États loading/success/empty/error gérés
[ ] Validation des formulaires
[ ] Gestion des permissions
[ ] Responsive design
[ ] Tests écrits
[ ] Tests réussis
[ ] Aucun appel API inutile ou dupliqué
[ ] Documentation mise à jour
[ ] Code review effectuée
[ ] Pull Request approuvée
[ ] CI réussie
[ ] Merge dans develop
```

---

# 34. Organisation des branches

La branche principale de développement est :

```text
main
└── develop
```

Les branches doivent être créées par fonctionnalité.

## Lead Frontend

```text
feature/frontend-architecture
feature/auth
feature/layout
feature/partenaires
feature/dsm
feature/bts
```

## Frontend POS

```text
feature/pos
feature/pos-type-nouveau-reconduit
feature/reconductions
feature/primes
```

## Frontend Clients

```text
feature/clients
feature/sims-stock
feature/requetes
feature/dashboard
feature/import-export
```

Les noms de branches doivent rester explicites et correspondre à une fonctionnalité identifiable.

La stratégie POSTrack impose une branche par fonctionnalité et une revue de code avant fusion dans `develop`. 

---

# 35. Règle concernant les conflits Git

Les développeurs doivent éviter de modifier simultanément les mêmes fichiers lorsqu'il n'y a pas de raison de le faire.

### Exemple à éviter

```text
Dev A ── modifie App.jsx
Dev B ── modifie App.jsx
Dev C ── modifie App.jsx
```

### Préférer

```text
Dev A
 └── routes / architecture

Dev B
 └── pages POS

Dev C
 └── pages Clients
```

Le Lead Frontend est prioritairement responsable des fichiers d'architecture globale.

Les développeurs B et C doivent éviter de modifier directement ces fichiers sans coordination.

---

# 36. Fichiers à responsabilité partagée

Certains fichiers peuvent être utilisés par tout le monde :

```text
App
routes
API client
types globaux
components/common
styles globaux
contexts
```

Ils sont considérés comme **fichiers sensibles**.

Avant une modification importante :

```text
Proposition
    ↓
Discussion avec le Lead
    ↓
Validation
    ↓
Modification
    ↓
Tests
```

---

# 37. Ordre de développement recommandé

## Phase 1 — Fondations

### Lead

```text
Architecture
Routing
MainLayout
Axios
AuthContext
ProtectedRoute
Components communs
```

### POS

```text
Préparation POS
POSListPage
POSForm
POSDetailPage
```

### Clients

```text
Préparation Clients
ClientsListPage
ClientForm
```

---

# 38. Phase 2 — Modules principaux

### Lead

```text
Partenaires
DSM
BTS
```

### POS

```text
Type Nouveau / Reconduit
Filtres POS
Détail POS
```

### Clients

```text
Stock SIM
SimStatusBadge
SimStockTable
```

---

# 39. Phase 3 — Règles métier

### Lead

```text
BTS
Historique des relevés
Saturation
```

### POS

```text
Reconduction
Historique
Primes
Validation des primes
```

### Clients

```text
Requêtes
Statuts
Priorités
```

La règle métier Nouveau/Reconduit et le module Primes sont des éléments critiques du MVP. Ils doivent donc faire l'objet d'une attention particulière pendant l'intégration et les tests. 

---

# 40. Phase 4 — Consolidation

### Lead

```text
Harmonisation UI
Gestion globale des erreurs
Permissions
Responsive
Navigation
```

### POS

```text
Tests POS
Tests Reconduction
Tests Primes
```

### Clients

```text
Tests Clients
Tests SIM
Tests Requêtes
Tests Dashboard
Tests Import/Export
```

---

# 41. Phase 5 — Intégration finale

Toute l'équipe :

```text
Merge des fonctionnalités
        ↓
Tests Frontend globaux
        ↓
Tests avec API réelle
        ↓
Correction des conflits
        ↓
Tests des rôles
        ↓
UAT
        ↓
Stabilisation
```

Le scénario critique à vérifier comprend notamment :

```text
Création POS
      ↓
POS = NOUVEAU
      ↓
Prime
      ↓
Client
      ↓
SIM
      ↓
Reconduction
      ↓
POS = RECONDUIT
      ↓
Tentative de nouvelle Prime
      ↓
Refus
```

Ce parcours constitue le scénario métier de référence de la recette POSTrack. 

---

# 42. Règles de collaboration

## Règle 1 — Le Lead possède l'architecture

Les développeurs B et C peuvent proposer des modifications architecturales, mais les changements structurants doivent être coordonnés avec le Lead.

---

## Règle 2 — Pas de code directement sur `develop`

Toujours :

```text
feature/*
     ↓
Pull Request
     ↓
Code Review
     ↓
develop
```

---

## Règle 3 — Toute PR doit être revue

Une fonctionnalité n'est pas considérée comme intégrée simplement parce qu'elle fonctionne sur l'ordinateur du développeur.

Elle doit passer par :

```text
Code
 ↓
Tests
 ↓
PR
 ↓
Review
 ↓
CI
 ↓
Merge
```

---

## Règle 4 — Pas de logique métier inventée côté Frontend

Le Frontend affiche et orchestre les données fournies par l'API.

Exemple :

```text
API
 ↓
type_pos = RECONDUIT
 ↓
Frontend
 ↓
TypePosBadge
```

et non :

```text
Frontend
 ↓
calcule lui-même que le POS est reconduit
```

Les règles métier critiques restent validées par le Backend.

---

## Règle 5 — Pas de duplication des composants

Avant de créer :

```text
CustomButton
```

vérifier si :

```text
components/common/Button
```

existe déjà.

---

## Règle 6 — Pas d'appels API dispersés

Les appels doivent passer par les services définis dans l'architecture.

---

## Règle 7 — La documentation évolue avec le code

Une modification importante de :

* route ;
* composant ;
* contrat API ;
* structure de données ;
* comportement métier ;
* architecture ;

doit être documentée.

---

# 43. Critère principal de réussite

L'organisation de l'équipe Frontend est réussie lorsque :

```text
Lead Frontend
    │
    ├── garantit l'architecture
    │
    ├── Développeur POS
    │       └── maîtrise tout le cycle POS
    │
    └── Développeur Clients
            └── maîtrise toute la chaîne Client
```

et que les trois développeurs peuvent travailler simultanément sans créer une dépendance permanente les uns envers les autres.

Le principe final est :

> **Chaque développeur est responsable de ses modules de bout en bout sur le Frontend, tandis que le Lead Frontend garantit la cohérence architecturale de l'ensemble de l'application.**

Cette organisation reste alignée avec l'architecture officielle de POSTrack : **React + Vite côté client, Axios pour les échanges REST, pages et composants spécialisés, et services Frontend dédiés aux différents domaines métier.** 
