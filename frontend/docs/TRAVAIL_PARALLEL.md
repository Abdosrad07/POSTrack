# POSTrack — Organisation Frontend et Travail Parallèle

> Document de référence pour la répartition des modules, la planification et la prévention des conflits Git.

**Projet :** POSTrack
**Version de référence :** Roadmap v3.1
**Frontend :** React + Vite + Tailwind CSS
**Tests :** Vitest + React Testing Library
**Équipe Frontend :** 3 développeurs

---

# 1. Objectif

Cette documentation définit une organisation permettant aux trois développeurs Frontend de :

* suivre la roadmap officielle ;
* travailler simultanément ;
* savoir exactement quels fichiers ils peuvent modifier ;
* limiter les conflits Git ;
* éviter les doublons ;
* éviter qu'un développeur bloque les deux autres ;
* intégrer progressivement les modules dans `develop`.

La roadmap officielle répartit l'équipe Frontend en trois responsabilités :

```text
Lead Frontend
    → Architecture React, routage, état global, Partenaires, DSM, BTS

Dev Frontend — Cycle de vie POS
    → POS, Reconduction, Primes

Dev Frontend — SIM / Requêtes / Dashboard
    → SIM, Requêtes, Dashboard, Import/Export
```

Cette répartition est conservée sans modification.

---

# 2. Principe fondamental

## Une fonctionnalité = un propriétaire = une branche

Chaque fonctionnalité possède :

```text
1 responsable
1 branche
1 ensemble de fichiers principalement concernés
1 Pull Request
```

Exemple :

```text
feature/pos
        │
        ├── POSListPage
        ├── POSDetailPage
        ├── POSForm
        └── posService
```

Le développeur responsable est le seul à modifier principalement cette zone.

---

# 3. Structure Git

Le dépôt suit :

```text
main
  │
  └── develop
       │
       ├── feature/...
       ├── bugfix/...
       └── hotfix/...
```

La roadmap impose une branche par fonctionnalité avec la convention :

```text
feature/<module>-<action>
```

et une revue de code avant fusion dans `develop`.

---

# 4. Répartition définitive

## Développeur 1 — Lead Frontend

### Domaine

```text
CORE
AUTHENTIFICATION
PARTENAIRES
DSM
BTS
```

### Responsabilités

```text
Architecture React
Routing
État global
Layout
Composants Common
Authentification
Partenaires
DSM
BTS
Relevés BTS
Intégration globale
CI
```

La roadmap attribue explicitement au Lead l'architecture, le routage, l'état global ainsi que Partenaires, DSM et BTS.

---

# 5. Développeur 2 — Cycle de vie POS

### Domaine

```text
POS
RECONDUCTIONS
PRIMES
```

### Responsabilités

```text
POSListPage
POSDetailPage
POSForm

ReconductionPage

PrimesListPage
PrimeForm
PrimeStatusBadge
```

Il est également responsable de la **restitution visuelle de la règle métier Nouveau/Reconduit**.

---

# 6. Développeur 3 — SIM / Requêtes / Dashboard

### Domaine

```text
SIM
REQUÊTES
DASHBOARD
IMPORT / EXPORT
```

### Responsabilités

```text
SimsStockPage

RequetesListPage
RequeteForm

DashboardPage

ImportExportPage
```

La roadmap attribue désormais ces pages au développeur Frontend transverse.

---

# 7. Matrice de propriété des fichiers

Cette matrice est la règle principale contre les conflits.

| Zone                        |   Dev 1   |         Dev 2        |         Dev 3        |
| --------------------------- | :-------: | :------------------: | :------------------: |
| `components/Common/`        | **OWNER** |        Utilise       |        Utilise       |
| `components/Layout/`        | **OWNER** |        Utilise       |        Utilise       |
| `context/`                  | **OWNER** |        Utilise       |        Utilise       |
| `hooks/`                    | **OWNER** |        Utilise       |        Utilise       |
| `routes/`                   | **OWNER** | Demande modification | Demande modification |
| `services/api.js`           | **OWNER** |        Utilise       |        Utilise       |
| `components/Partenaires/`   | **OWNER** |           —          |           —          |
| `components/DSM/`           | **OWNER** |           —          |           —          |
| `components/BTS/`           | **OWNER** |           —          |           —          |
| `components/POS/`           |     —     |       **OWNER**      |           —          |
| `components/Reconductions/` |     —     |       **OWNER**      |           —          |
| `components/Primes/`        |     —     |       **OWNER**      |           —          |
| `components/Sims/`          |     —     |           —          |       **OWNER**      |
| `components/Requetes/`      |     —     |           —          |       **OWNER**      |
| `components/Dashboard/`     |     —     |           —          |       **OWNER**      |
| `pages/auth/`               | **OWNER** |           —          |           —          |
| `pages/partenaires/`        | **OWNER** |           —          |           —          |
| `pages/dsm/`                | **OWNER** |           —          |           —          |
| `pages/bts/`                | **OWNER** |           —          |           —          |
| `pages/pos/`                |     —     |       **OWNER**      |           —          |
| `pages/reconductions/`      |     —     |       **OWNER**      |           —          |
| `pages/primes/`             |     —     |       **OWNER**      |           —          |
| `pages/sims/`               |     —     |           —          |       **OWNER**      |
| `pages/requetes/`           |     —     |           —          |       **OWNER**      |
| `pages/dashboard/`          |     —     |           —          |       **OWNER**      |
| `pages/import-export/`      |     —     |           —          |       **OWNER**      |

---

# 8. Règle importante : OWNER ne signifie pas propriété exclusive

`OWNER` signifie :

> Ce développeur est responsable de la cohérence de cette zone et doit être le principal contributeur.

Cela ne signifie pas :

> Les autres développeurs n'ont jamais le droit de toucher au code.

Une modification importante dans une zone appartenant à quelqu'un d'autre doit cependant être discutée avec son responsable.

---

# 9. Fichiers communs sensibles

Certains fichiers peuvent provoquer énormément de conflits.

Ils doivent donc être considérés comme des **zones protégées** :

```text
App.jsx
main.jsx
routes/
context/
services/api.js
package.json
vite.config.js
vitest.config.js
eslint.config.js
```

## Règle

Le Dev 1 est responsable de ces fichiers.

Les Dev 2 et 3 ne les modifient pas directement sauf nécessité.

---

# 10. Comment les Dev 2 et 3 ajoutent leurs routes

Le problème classique est :

```text
Dev 2 modifie routes/index.jsx
Dev 3 modifie routes/index.jsx
Dev 1 modifie routes/index.jsx
```

Résultat :

```text
CONFLIT GIT
```

Pour éviter cela :

### Dev 2

Il crée sa page :

```text
pages/pos/POSListPage.jsx
```

mais ne modifie pas directement la configuration globale des routes.

Il indique dans sa PR :

```text
Route nécessaire :

/pos
```

Le Lead ajoute ou intègre les routes.

### Dev 3

Même principe :

```text
pages/clients/ClientsListPage.jsx
```

et demande l'intégration :

```text
/clients
```

Ainsi :

```text
Dev 2 ──→ pages/pos/
           │
           └──→ PR

Dev 3 ──→ pages/sims/
           │
           └──→ PR

Dev 1 ──→ routes/
           │
           ├──→ /pos
            └──→ /sims
```

Cela réduit fortement les conflits.

---

# 11. Même principe pour les composants Common

Le Dev 2 ne doit pas modifier :

```text
components/Common/Table.jsx
```

pour répondre à un besoin spécifique de POS.

Il doit d'abord demander au Lead si le composant commun doit évoluer.

Même règle pour le Dev 3.

Cela empêche :

```text
POS
   ↓
modification Table

Clients
   ↓
modification Table

Dashboard
   ↓
modification Table
```

de provoquer trois versions incompatibles du même composant.

---

# 12. Planning parallèle selon la roadmap

La roadmap officielle reste la référence.

Mais l'organisation Git permet aux trois développeurs de travailler simultanément.

---

# 13. JOUR 1 — Architecture

### Roadmap

L'équipe Frontend travaille sur :

```text
MainLayout
Composants Common
Table
Modal
Badge
```

### Organisation

**Dev 1**

```text
MainLayout
Common
Routing skeleton
Structure globale
```

**Dev 2**

```text
Analyse du module POS
Préparation des composants POS
Préparation des mocks
Préparation POSForm
```

**Dev 3**

```text
Analyse Clients/SIM/Requêtes
Préparation des composants
Préparation des mocks
Préparation ClientsListPage
```

### Pourquoi ?

Les Dev 2 et 3 ne doivent pas rester inactifs simplement parce que leur livrable officiel arrive plus tard.

Ils préparent leurs domaines **sans toucher au Core du Dev 1**.

---

# 14. JOUR 2 — Core

### Roadmap

Le Frontend finalise :

```text
MainLayout
Table
Modal
Badge
```

### Dev 1

Travail officiel :

```text
Core
Layout
Components Common
```

### Dev 2

Travail parallèle :

```text
components/POS/
pages/pos/
mocks/pos.js
```

### Dev 3

Travail parallèle :

```text
pages/clients/
pages/sims/
mocks/sims.js
```

Ils utilisent uniquement les composants Common existants.

---

# 15. JOUR 3 — Authentification

### Roadmap

Le Frontend développe :

```text
LoginPage
AuthContext
intercepteur Axios
ProtectedRoute
```

### Dev 1

```text
LoginPage
AuthContext
Axios interceptor
ProtectedRoute
```

### Dev 2

Continue :

```text
POS UI
POS mocks
POS validation
```

### Dev 3

Continue :

```text
SIM UI
SIM mocks
SIM validation
```

Ils ne modifient pas `AuthContext`.

---

# 16. JOUR 4 — Partenaires et DSM

### Roadmap

Matin :

```text
PartenairesListPage
PartenaireForm
```

Après-midi :

```text
DSMListPage
DSMForm
```

### Dev 1

Développe les modules officiels.

### Dev 2

Continue la préparation :

```text
POS
```

### Dev 3

Continue :

```text
Clients
SIM
```

---

# 17. JOUR 5 — BTS

### Roadmap

Matin :

```text
BTSListPage
BTSForm
```

Après-midi :

```text
SaturationGauge
Historique des relevés
```

### Dev 1

Développe BTS.

### Dev 2

Finalise :

```text
POS UI
```

### Dev 3

Finalise :

```text
SIM UI
```

---

# 18. JOURS 6–7 — Rattrapage

La roadmap prévoit ces deux jours comme créneau de rattrapage facultatif.

### Utilisation recommandée

Chaque développeur doit utiliser cette période pour :

```text
corriger ses retards
résoudre les bugs
faire passer le CI
mettre à jour sa branche
préparer les modules de semaine 2
```

Pas de nouvelle fonctionnalité importante si les P0 précédents ne sont pas stabilisés.

---

# 19. JOUR 8 — POS

### Roadmap

Matin :

```text
POSListPage
TypePosBadge
FilterBar
```

Après-midi :

```text
POSDetailPage
POSForm
```

### Dev 2

Travail principal :

```text
feature/pos
```

Fichiers :

```text
pages/pos/
components/POS/
services/posService.js
```

### Dev 1

Intègre les routes et vérifie l'intégration globale.

### Dev 3

Prépare :

```text
Clients
SIM
```

sans modifier les fichiers POS.

---

# 20. JOUR 9 — Reconductions et Primes

### Dev 2

Matin :

```text
ReconductionPage
Confirmation explicite
```

Après-midi :

```text
PrimesListPage
PrimeStatusBadge
Actions de validation
```

Le parcours critique est :

```text
POS NOUVEAU
      ↓
Prime éligible
      ↓
Reconduction
      ↓
POS RECONDUIT
      ↓
Nouvelle prime impossible
```

La roadmap exige une démonstration de ce parcours et un test automatisé pour les PR touchant cette règle.

---

# 21. JOUR 10 — Clients et SIM

### Dev 3

Matin :

```text
ClientsListPage
ClientForm
```

Après-midi :

```text
SimsStockPage
```

### Dev 2

Stabilise :

```text
POS
Reconduction
Primes
```

### Dev 1

Assure :

```text
routing
permissions
integration
UI globale
```

---

# 22. JOUR 11 — Requêtes et Import/Export

### Dev 3

Matin :

```text
RequetesListPage
RequeteForm
```

Après-midi :

```text
ImportExportPage
```

### Dev 1

Prépare l'intégration des nouvelles routes.

### Dev 2

Corrige et teste le scénario POS → Reconduction → Prime.

---

# 23. JOUR 12 — Dashboard et Audit

### Dev 3

Matin :

```text
DashboardPage
StatCards
Recharts
```

Le dashboard doit notamment afficher :

```text
Nouveau / Reconduit
Primes
BTS
SIM
Requêtes
```

Après-midi :

```text
AuditLogsPage
```

La roadmap prévoit explicitement ces deux tâches Frontend.

### Dev 1

Finitions UI transversales.

### Dev 2

Finitions du cycle de vie POS.

---

# 24. JOUR 13 — Tests et recette

La roadmap prévoit le test des composants critiques :

```text
POSForm
PrimeForm
ReconductionPage
```

### Organisation

**Dev 1**

```text
Tests Core
Auth
Routing
Permissions
```

**Dev 2**

```text
POSForm
PrimeForm
ReconductionPage
```

**Dev 3**

```text
SimsStockPage
Clients
Requêtes
Dashboard
Import/Export
```

### Après-midi

Toute l'équipe :

```text
UAT
Correction des bugs
Tests de bout en bout
```

---

# 25. JOUR 14 — Déploiement

Toute l'équipe :

```text
Build final
Tests finaux
Données de démonstration
Déploiement local
Répétition présentation
Présentation client
```

La roadmap prévoit le déploiement et la préparation de la présentation finale ce jour-là.

---

# 26. Stratégie de branches

## Dev 1

```text
feature/frontend-core
feature/auth
feature/partenaires
feature/dsm
feature/bts
feature/bts-releves
feature/audit
```

## Dev 2

```text
feature/pos
feature/pos-type-nouveau-reconduit
feature/reconductions
feature/primes
```

La roadmap fournit notamment :

```text
feature/pos-type-nouveau-reconduit
feature/reconductions
feature/primes
```

comme exemples de branches.

## Dev 3

```text
feature/clients
feature/sims-stock
feature/requetes
feature/import-export
feature/dashboard
```

---

# 27. Règle : une PR doit rester petite

Éviter :

```text
feature/complete-frontend
```

avec 40 fichiers modifiés.

Préférer :

```text
feature/pos-list
feature/pos-form
feature/reconductions
feature/primes
```

Cela permet :

```text
PR petite
   ↓
CI rapide
   ↓
Review facile
   ↓
Merge simple
```

---

# 28. Règle : ne jamais travailler directement sur develop

Interdit :

```text
develop
   ↓
coder directement
```

Toujours :

```text
develop
   ↓
git checkout -b feature/...
   ↓
développement
   ↓
commit
   ↓
push
   ↓
Pull Request
```

---

# 29. Synchronisation quotidienne

Avant de commencer :

```bash
git checkout develop
git pull origin develop
```

Puis :

```bash
git checkout -b feature/ma-fonctionnalite
```

Avant la PR :

```bash
git fetch origin
git rebase origin/develop
```

Puis :

```bash
npm run lint
npm run test:run
npm run build
```

---

# 30. Pourquoi utiliser rebase avant la PR ?

Supposons :

```text
Dev 2
feature/pos
```

et pendant ce temps :

```text
Dev 1
merge feature/bts → develop
```

La branche POS devient légèrement ancienne.

Le Dev 2 fait :

```bash
git fetch origin
git rebase origin/develop
```

Il vérifie ensuite :

```bash
npm run lint
npm run test:run
npm run build
```

Puis il pousse sa branche.

Cela permet de détecter les conflits **avant** la fusion.

---

# 31. Comment intégrer des changements depuis une autre branche (Merge vs Rebase)

Il existe deux commandes principales pour intégrer des changements d'une branche à une autre : `git merge` et `git rebase`. Le choix entre les deux dépend de la stratégie de votre équipe et du résultat souhaité en termes d'historique Git.

## `git merge`

`git merge` intègre les changements d'une branche source dans votre branche actuelle en créant un nouveau "merge commit".

**Quand l'utiliser :**
- Pour intégrer une branche de fonctionnalité stable dans `develop` ou `main`.
- Quand vous souhaitez conserver un historique non linéaire qui montre explicitement quand les intégrations ont eu lieu.
- Si vous avez déjà partagé votre branche avec d'autres et que vous ne voulez pas réécrire l'historique (ce que `rebase` ferait).

**Exemple :**
Si vous êtes sur votre branche `feature/ma-fonctionnalite` et que vous voulez intégrer les dernières modifications de `develop` :

```bash
# Assurez-vous que votre branche locale 'develop' est à jour
git checkout develop
git pull origin develop

# Revenez à votre branche de fonctionnalité
git checkout feature/ma-fonctionnalite

# Fusionnez 'develop' dans votre branche actuelle
git merge develop
```
En cas de conflits, Git vous guidera pour les résoudre. Une fois résolus, vous devrez faire un `git commit` pour finaliser la fusion.

## `git rebase`

`git rebase` intègre les changements d'une branche source dans votre branche actuelle en déplaçant ou en recréant les commits de votre branche à la fin de la branche source. Cela crée un historique linéaire plus "propre".

**Quand l'utiliser :**
- Pour garder votre branche de fonctionnalité à jour avec `develop` pendant que vous travaillez, avant de faire une Pull Request.
- Quand vous souhaitez un historique de projet très linéaire, sans "merge commits" superflus.
- **Attention :** Ne rebasez jamais une branche qui a déjà été poussée et partagée avec d'autres, car cela réécrit l'historique et peut causer des problèmes pour les collaborateurs.

**Exemple :**
Si vous êtes sur votre branche `feature/ma-fonctionnalite` et que vous voulez appliquer vos commits sur les dernières modifications de `develop` :

```bash
# Assurez-vous que votre branche locale 'develop' est à jour
git checkout develop
git pull origin develop

# Revenez à votre branche de fonctionnalité
git checkout feature/ma-fonctionnalite

# Rebasez votre branche sur 'develop'
git rebase develop
```
En cas de conflits, Git mettra en pause le rebase pour que vous puissiez les résoudre. Après avoir résolu un conflit, utilisez `git add <fichier_conflit>` puis `git rebase --continue`. Si vous souhaitez annuler le rebase, utilisez `git rebase --abort`.

Une fois le rebase terminé, vous aurez un historique propre où vos commits apparaissent après les commits de `develop`. Si vous aviez déjà poussé votre branche, vous devrez utiliser `git push --force` (ou `git push --force-with-lease`), mais cela doit être fait avec une extrême prudence et uniquement si vous êtes le seul à travailler sur cette branche ou après avoir communiqué avec votre équipe. Dans le cadre de ce projet, nous privilégions le `rebase` avant la PR pour garder l'historique propre et gérer les conflits localement.

---

# 32. Règle spéciale pour les fichiers partagés


Si une PR doit modifier :

```text
App.jsx
routes/
context/
services/api.js
package.json
```

elle doit être signalée comme :

```text
SHARED FILE CHANGE
```

dans la PR.

Le Lead doit être reviewer de cette partie.

---

# 32. Règle spéciale pour package.json

Un développeur ne doit pas ajouter une dépendance sans prévenir les autres.

Mauvais :

```text
Dev 2
npm install quelque-chose
```

sans prévenir.

Correct :

```text
Dev 2
→ annonce la dépendance
→ explique pourquoi
→ installation coordonnée
→ CI
```

Cela évite les conflits dans :

```text
package.json
package-lock.json
```

---

# 33. Mocks : la clé du travail parallèle

Lorsque le Backend n'est pas encore prêt, les développeurs peuvent utiliser des données mockées.

Exemple :

```text
mocks/
├── partenaires.js
├── dsm.js
├── bts.js
├── pos.js
├── reconductions.js
├── primes.js
├── clients.js
├── sims.js
└── requetes.js
```

Chaque développeur possède principalement les mocks de son domaine.

Ainsi :

```text
Dev 1 → mocks/partenaires.js
Dev 2 → mocks/pos.js
Dev 3 → mocks/clients.js
```

Le mock doit respecter la structure prévue par l'API réelle.

---

# 34. Travail Frontend avant disponibilité du Backend

Le Frontend ne doit pas attendre systématiquement que le Backend termine.

Exemple :

```text
Backend
    │
    └── développe /api/pos

Frontend
    │
    ├── construit POSListPage
    ├── construit POSForm
    ├── construit TypePosBadge
    ├── construit FilterBar
    └── utilise mock
```

Lorsque l'API devient disponible :

```text
mock
  ↓
posService
  ↓
API réelle
```

L'interface n'a pas besoin d'être entièrement reconstruite.

---

# 35. Contrat entre Frontend et Backend

Chaque module doit avoir un petit contrat API.

Exemple :

```text
POS

GET    /api/pos
POST   /api/pos
GET    /api/pos/{id}
PUT    /api/pos/{id}
PATCH  /api/pos/{id}/status
POST   /api/pos/{id}/reconduction
```

Le Frontend ne doit pas inventer les endpoints.

Le contrat doit être vérifié avec le Backend.

---

# 36. Règle concernant les composants communs

Avant de créer :

```text
Table
Modal
Badge
Button
Input
Select
Alert
```

chercher dans :

```text
components/Common/
```

Si le composant existe :

```text
→ réutiliser
```

S'il doit évoluer :

```text
→ demander au Lead
```

---

# 37. Règle concernant les composants métier

Un composant métier reste dans son domaine.

Exemple :

```text
TypePosBadge
```

reste dans :

```text
components/POS/
```

et non :

```text
components/Common/
```

car il possède une signification métier spécifique.

---

# 38. Règle concernant les routes

Les routes sont centralisées.

Les développeurs de modules fournissent :

```text
nom de page
route souhaitée
permissions
```

Exemple :

```text
Page:
POSListPage

Route:
/pos

Permission:
ADMIN | MANAGER | DSM
```

Le Lead réalise l'intégration dans le routing global.

---

# 39. Règle concernant les permissions

Les quatre rôles définis sont :

```text
ADMIN
MANAGER
DSM
VIEWER
```

Le rôle DSM possède une portée limitée aux entités de sa zone.

Les développeurs doivent donc prévoir les états :

```text
autorisé
non autorisé
lecture seule
```

Mais les contrôles définitifs restent côté Backend.

---

# 40. Règle concernant la règle métier critique

Le scénario de référence est :

```text
Créer POS
   ↓
POS = NOUVEAU
   ↓
Prime possible
   ↓
Reconduction
   ↓
POS = RECONDUIT
   ↓
Nouvelle prime interdite
```

Cette règle est au cœur du projet. Le cahier des charges précise que seuls les POS nouvellement créés ouvrent droit à une prime.

Toute PR concernant :

```text
POS
Reconduction
Prime
```

doit vérifier qu'elle ne casse pas ce parcours.

---

# 41. CI obligatoire avant merge

Chaque Pull Request doit passer :

```bash
npm ci
npm run lint
npm run test:run
npm run build
```

Le CI doit être obligatoire avant merge.

Pour les PR touchant :

```text
Nouveau / Reconduit
Primes
```

un test automatisé est obligatoire conformément à la roadmap.

---

# 42. Code Review

La roadmap impose une revue de code par un membre d'une autre équipe avant fusion.

Pour le Frontend :

```text
Dev 1 → Dev 2 ou Dev 3
Dev 2 → Dev 1 ou Dev 3
Dev 3 → Dev 1 ou Dev 2
```

Le reviewer vérifie :

```text
Architecture
Qualité
Tests
UI
Responsabilités
Régressions
Respect du cahier des charges
```

---

# 43. Ce qu'un développeur ne doit pas faire

### Interdit

Modifier directement :

```text
develop
```

### À éviter

Modifier simultanément :

```text
routes/
context/
App.jsx
```

sans coordination.

### Interdit

Créer une deuxième version d'un composant Common.

### À éviter

Changer l'architecture pour une seule fonctionnalité.

### Interdit

Inventer un endpoint Backend.

### Interdit

Inventer une règle métier.

---

# 44. Workflow quotidien

Chaque développeur suit :

```text
1. Lire sa tâche
       ↓
2. Identifier son module
       ↓
3. Vérifier les fichiers concernés
       ↓
4. Mettre develop à jour
       ↓
5. Créer sa branche
       ↓
6. Développer
       ↓
7. Tester
       ↓
8. Rebase sur develop
       ↓
9. Tester à nouveau
       ↓
10. Push
       ↓
11. Pull Request
       ↓
12. CI
       ↓
13. Code Review
       ↓
14. Merge
```

---

# 45. Stratégie de merge

Le merge se fait dans :

```text
develop
```

et jamais directement dans :

```text
main
```

Pendant le développement :

```text
feature
   ↓
PR
   ↓
CI
   ↓
Review
   ↓
develop
```

À la fin d'une journée validée :

```text
develop
   ↓
main
```

La roadmap prévoit une fusion de `develop` vers `main` à chaque fin de journée avec un livrable validé.

---

# 46. Tableau de travail parallèle

| Jour | Dev 1 — Lead          | Dev 2 — POS                | Dev 3 — Client               |
| ---- | --------------------- | -------------------------- | ---------------------------- |
| J1   | Core / Architecture   | Préparation POS            | Préparation SIM               |
| J2   | Core                  | POS UI / mocks             | SIM UI / mocks                |
| J3   | Auth                  | POS                        | SIM                           |
| J4   | Partenaires + DSM     | POS                        | SIM + Requêtes                |
| J5   | BTS + relevés         | POS                        | SIM + Requêtes                |
| J6-7 | Rattrapage            | Rattrapage                 | Rattrapage                   |
| J8   | Intégration           | **POS complet**            | Préparation SIM              |
| J9   | Intégration           | **Reconductions + Primes** | Clients / SIM                |
| J10  | Routing / permissions | Stabilisation              | **Clients + SIM**            |
| J11  | Intégration           | Stabilisation POS          | **Requêtes + Import/Export** |
| J12  | UI transverse         | Stabilisation métier       | **Dashboard + Audit**        |
| J13  | Tests Core/Auth       | **Tests critiques**        | Tests modules                |
| J14  | Déploiement           | Déploiement                | Déploiement                  |

Cette organisation **ne change pas les responsabilités de la roadmap** ; elle permet simplement aux développeurs dont les livrables arrivent plus tard de préparer leurs modules dans leurs propres zones de fichiers.

---

# 47. Résultat recherché

L'organisation doit produire ce schéma :

```text
                    develop
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       Dev 1         Dev 2        Dev 3
       Core           POS        Clients
       Auth        Reconduction     SIM
     Partenaire       Prime       Requêtes
        DSM                         Dashboard
        BTS                       Import/Export
          │            │            │
          ▼            ▼            ▼
       Branche       Branche      Branche
          │            │            │
          ▼            ▼            ▼
          PR           PR           PR
          │            │            │
          └────────────┼────────────┘
                       ▼
                      CI
                       │
                       ▼
                  Code Review
                       │
                       ▼
                    develop
```

---

# 48. Principe final

L'objectif n'est pas seulement que trois développeurs puissent **coder en même temps**.

L'objectif est qu'ils puissent coder en même temps **sans avoir besoin de modifier les mêmes fichiers**.

La règle centrale devient donc :

```text
MODULE = PROPRIÉTAIRE = BRANCHE = PR
```

et pour les éléments transversaux :

```text
CORE = LEAD FRONTEND
```

Ainsi :

```text
Dev 1 → protège le socle
Dev 2 → protège le cycle de vie POS
Dev 3 → protège la chaîne SIM / Requêtes / Dashboard
```

Les trois peuvent avancer simultanément, puis leurs travaux sont réunis progressivement dans `develop` par Pull Requests validées.

---

# 49. Référence de la roadmap

Cette organisation s'appuie sur la roadmap POSTrack v3.1 :

* répartition officielle des trois développeurs Frontend ;
* stratégie Git et branches par fonctionnalité ;
* séquence des jours 1 à 5 ;
* POS, Reconductions et Primes aux jours 8–9 ; - Clients, SIM, Requêtes, Import/Export et Dashboard aux jours 10–12 ;
* tests et recette au jour 13 ;
* déploiement et présentation au jour 14.
