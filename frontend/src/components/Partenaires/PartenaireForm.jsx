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

# 4. Répartition des zones de responsabilité

## Lead Frontend

```text
components/Common/
components/Layout/
context/
hooks/
routes/
pages/auth/
pages/partenaires/
pages/dsm/
pages/bts/
services/api.js
App.jsx
main.jsx
package.json
vite.config.*
eslint.config.*
vitest.config.*
```

## Développeur POS

```text
components/POS/
components/Primes/
pages/pos/
pages/reconductions/
pages/primes/
services/posService.js
services/primeService.js
```

## Développeur Client

```text
components/Sims/
components/Requetes/
components/Dashboard/
pages/clients/
pages/sims/
pages/requetes/
pages/dashboard/
pages/import-export/
services/clientService.js
services/simService.js
services/requeteService.js
```

---

# 5. Fichiers sensibles

Certains fichiers sont susceptibles d'être modifiés par plusieurs développeurs et doivent donc être protégés.

Exemples :

```text
App.jsx
main.jsx
package.json
package-lock.json
routes/*
services/api.js
vite.config.*
tailwind.config.*
eslint.config.*
vitest.config.*
```

## Règle

Un développeur ne modifie pas ces fichiers sans raison.

Si une fonctionnalité nécessite une modification dans un fichier partagé :

1. le développeur prévient le Lead ;
2. la modification est discutée ;
3. le changement est réalisé proprement ;
4. la PR mentionne cette modification.

Cela permet d'éviter les conflits artificiels.

---

# 6. Stratégie Git

La structure principale est :

```text
main
  │
  └── develop
        │
        ├── feature/frontend-foundation
        ├── feature/frontend-auth
        ├── feature/frontend-partenaires
        ├── feature/frontend-dsm
        ├── feature/frontend-bts
        ├── feature/frontend-pos
        ├── feature/frontend-reconductions
        ├── feature/frontend-primes
        ├── feature/frontend-clients
        ├── feature/frontend-sims
        ├── feature/frontend-requetes
        ├── feature/frontend-dashboard
        └── feature/frontend-import-export
```

---

# 7. Règles Git obligatoires

## Règle 1 — Ne jamais développer directement sur `develop`

Interdit :

```bash
git checkout develop
# développement directement ici
git push origin develop
```

Correct :

```bash
git checkout develop
git pull origin develop

git checkout -b feature/frontend-pos
```

---

## Règle 2 — Une fonctionnalité = une branche

Exemple :

```text
feature/frontend-pos
```

ou, pour une fonctionnalité plus précise :

```text
feature/frontend-pos-list
```

```text
feature/frontend-pos-form
```

```text
feature/frontend-pos-detail
```

---

## Règle 3 — Une branche doit partir de `develop`

Avant de commencer :

```bash
git checkout develop
git pull origin develop
git checkout -b feature/frontend-pos
```

---

## Règle 4 — Les commits doivent être explicites

Utiliser une convention de type :

```text
feat:
fix:
test:
refactor:
style:
docs:
chore:
```

Exemples :

```text
feat(pos): add POS list page
feat(pos): add POS creation form
test(pos): add POS form tests
fix(pos): handle API validation error
refactor(pos): simplify POS filters
```

---

# 8. Synchronisation avec `develop`

Pendant qu'un développeur travaille, les autres peuvent fusionner leurs fonctionnalités dans `develop`.

La branche de travail peut donc devenir obsolète.

Avant d'ouvrir une PR ou avant un gros changement, synchroniser :

```bash
git fetch origin
git merge origin/develop
```

ou selon la convention retenue par l'équipe :

```bash
git rebase origin/develop
```

L'équipe doit choisir **une seule stratégie** et l'appliquer systématiquement.

Pour une équipe étudiante travaillant rapidement, `merge` est généralement plus simple à comprendre.

---

# 9. Pull Request

Lorsqu'une fonctionnalité est terminée :

```bash
git push -u origin feature/frontend-pos
```

Créer ensuite une Pull Request :

```text
feature/frontend-pos
        ↓
      develop
```

La PR doit expliquer :

- ce qui a été développé ;
- les fichiers principaux concernés ;
- les tests réalisés ;
- les éventuelles dépendances avec le Backend ;
- les éventuels points nécessitant une attention particulière.

---

# 10. CI — Continuous Integration

Chaque Pull Request doit être automatiquement vérifiée.

Pipeline :

```text
Pull Request
     │
     ▼
 npm ci
     │
     ▼
 ESLint
     │
     ▼
 Vitest
     │
     ▼
 npm run build
     │
     ▼
 ┌───┴────┐
 │        │
 PASS    FAIL
 │        │
 ▼        ▼
Review   Correction
 │
 ▼
Merge
```

Le CI doit au minimum vérifier :

```bash
npm ci
npm run lint
npm run test:run
npm run build
```

Une PR dont le CI échoue ne doit pas être fusionnée.

---

# 11. Code Review

Chaque PR doit être relue par au moins un autre membre de l'équipe.

Rotation recommandée :

```text
Lead → Développeur POS
Développeur POS → Développeur Client
Développeur Client → Lead
```

Le reviewer vérifie notamment :

### Fonctionnalité

- La fonctionnalité répond-elle à la tâche ?
- Le comportement attendu est-il respecté ?

### Architecture

- Les fichiers sont-ils au bon endroit ?
- Les composants sont-ils correctement séparés ?
- Le développeur a-t-il évité de modifier inutilement le Core ?

### Code

- Le code est-il lisible ?
- Les noms sont-ils cohérents ?
- Y a-t-il du code dupliqué ?

### Tests

- Les cas importants sont-ils testés ?
- Les tests passent-ils ?

### UI

- L'interface respecte-t-elle le design ?
- Les états `loading`, `error` et `empty` sont-ils gérés ?

---

# 12. Tests obligatoires

Les composants critiques du projet doivent être testés avec :

```text
Vitest
React Testing Library
```

Les éléments particulièrement importants comprennent :

```text
POSForm
ReconductionPage
PrimeForm
SimsStockPage
```

Les fonctionnalités liées à `NOUVEAU/RECONDUIT` et aux `Primes` doivent faire l'objet d'une attention particulière.

---

# 13. Mode opératoire standard pour développer une fonctionnalité

Cette procédure doit être suivie **à chaque nouvelle fonctionnalité**.

---

## Étape 1 — Comprendre la tâche

Avant de coder, répondre à :

```text
Qu'est-ce que je dois construire ?
Quels écrans sont concernés ?
Quels composants sont nécessaires ?
Quelle API sera utilisée ?
Quels rôles peuvent utiliser cette fonctionnalité ?
Quels états doivent être gérés ?
```

Ne pas commencer directement par écrire du code.

---

## Étape 2 — Identifier la zone de responsabilité

Déterminer à quel domaine appartient la fonctionnalité :

```text
Core
Partenaire
DSM
BTS
POS
Reconduction
Prime
Client
SIM
Requête
Dashboard
Import/Export
```

Si la fonctionnalité appartient à une autre zone, elle doit être attribuée au développeur responsable.

---

## Étape 3 — Vérifier `develop`

Toujours partir d'une version récente :

```bash
git checkout develop
git pull origin develop
```

---

## Étape 4 — Créer la branche

Exemple :

```bash
git checkout -b feature/frontend-pos-form
```

---

## Étape 5 — Préparer la structure

Avant d'implémenter toute la logique, créer les fichiers nécessaires.

Exemple :

```text
pages/pos/
└── POSFormPage.jsx

components/POS/
└── POSForm.jsx

services/
└── posService.js
```

---

## Étape 6 — Développer avec des données mockées si nécessaire

Si le Backend n'est pas encore disponible, ne pas bloquer le Frontend.

Utiliser temporairement :

```javascript
const mockPOS = [
  {
    id: 1,
    code: 'POS-001',
    nom: 'POS Exemple',
    type_pos: 'NOUVEAU',
  },
]
```

L'objectif est de construire et tester l'interface avant que l'API soit disponible.

---

## Étape 7 — Implémenter les états UI

Chaque page importante doit prévoir au minimum :

```text
Loading
Success
Empty
Error
```

Exemple :

```text
Chargement...
     ↓
Données disponibles
     ↓
Affichage

ou

Erreur API
     ↓
Message d'erreur
     ↓
Possibilité de réessayer
```

---

## Étape 8 — Connecter l'API

Lorsque le Backend est disponible :

```text
Page
 ↓
Service
 ↓
Axios
 ↓
API FastAPI
```

Éviter de placer directement des appels Axios partout dans les composants.

Exemple :

```text
POSListPage
     ↓
posService.getAll()
     ↓
GET /api/pos
```

---

## Étape 9 — Écrire les tests

Créer les tests correspondant à la fonctionnalité.

Exemple :

```text
POSForm.test.jsx
```

Tester notamment :

- rendu ;
- saisie ;
- validation ;
- soumission ;
- erreurs ;
- comportement attendu après succès.

---

## Étape 10 — Tester localement

Avant la PR :

```bash
npm run lint
npm run test:run
npm run build
```

Les trois commandes doivent réussir.

---

## Étape 11 — Vérifier les changements Git

Exécuter :

```bash
git status
git diff
```

Vérifier :

- qu'aucun fichier inutile n'a été modifié ;
- qu'aucun fichier sensible n'a été modifié accidentellement ;
- qu'aucune clé API ou donnée confidentielle n'est présente ;
- que les fichiers de debug ne sont pas commités.

---

## Étape 12 — Commit

Faire un commit clair :

```bash
git add .
git commit -m "feat(pos): add POS creation form"
```

Éviter les commits comme :

```text
update
test
fix
final
final2
```

---

## Étape 13 — Push

```bash
git push -u origin feature/frontend-pos-form
```

---

## Étape 14 — Créer la Pull Request

Créer :

```text
feature/frontend-pos-form
            ↓
         develop
```

Titre :

```text
feat(pos): add POS creation form
```

Description :

```text
## Description

Ajout du formulaire de création d'un POS.

## Modifications

- ajout de POSForm
- ajout de POSFormPage
- ajout de posService
- gestion des erreurs API

## Tests

- POSForm render
- validation
- soumission
- gestion des erreurs

## Vérifications

- npm run lint
- npm run test:run
- npm run build
```

---

# 15. Attendre le CI

GitHub Actions lance automatiquement :

```text
Install
   ↓
Lint
   ↓
Tests
   ↓
Build
```

Si tout passe :

```text
✅ CI passed
```

La PR peut être reviewée.

Si une étape échoue :

```text
❌ CI failed
```

Le développeur doit corriger la branche.

---

# 16. Code Review

Le reviewer examine la PR.

Trois résultats possibles :

```text
APPROVED
```

La PR peut être fusionnée.

```text
CHANGES REQUESTED
```

Le développeur corrige.

```text
COMMENT
```

Une remarque est faite sans bloquer nécessairement la PR.

---

# 17. Corriger une PR

Après modification :

```bash
git add .
git commit -m "fix(pos): address review comments"
git push
```

La PR est automatiquement mise à jour.

Le CI est relancé.

---

# 18. Merge

Une fois :

```text
CI       ✅
Review   ✅
Approval ✅
```

la PR peut être fusionnée dans :

```text
develop
```

Le développeur peut ensuite supprimer sa branche distante.

---

# 19. Après le merge

Chaque développeur doit remettre son environnement à jour :

```bash
git checkout develop
git pull origin develop
```

Pour commencer une nouvelle fonctionnalité :

```bash
git checkout -b feature/frontend-nouvelle-fonctionnalite
```

Il ne faut pas continuer plusieurs jours sur une ancienne branche déjà fusionnée.

---

# 20. Gestion des conflits

Un conflit n'est pas une catastrophe.

Il indique simplement que deux branches ont modifié une même partie du code.

Exemple :

```text
develop
   │
   ├── développeur A → App.jsx
   │
   └── développeur B → App.jsx
```

C'est précisément ce type de situation que l'organisation par domaines cherche à éviter.

Si un conflit apparaît :

1. ne pas écraser le travail de l'autre ;
2. identifier les deux modifications ;
3. comprendre pourquoi elles existent ;
4. discuter avec le développeur concerné si nécessaire ;
5. résoudre le conflit ;
6. tester ;
7. continuer la PR.

---

# 21. Ce qu'il ne faut jamais faire

## ❌ Modifier directement `develop`

```bash
git push origin develop
```

## ❌ Modifier la branche d'un autre développeur

Sauf accord explicite.

## ❌ Faire une énorme PR

Exemple à éviter :

```text
50 fichiers
+ 3000 lignes
```

pour une petite fonctionnalité.

## ❌ Fusionner une PR avec un CI rouge

```text
CI ❌
↓
Merge
```

Interdit.

## ❌ Mettre des secrets dans Git

Ne jamais commit :

```text
.env
API keys
tokens
passwords
credentials
```

---

# 22. Checklist avant chaque Pull Request

Avant de cliquer sur **Create Pull Request** :

```text
[ ] Ma branche part bien de develop
[ ] Ma fonctionnalité est terminée
[ ] Je n'ai pas modifié inutilement des fichiers partagés
[ ] Je n'ai pas de code de debug
[ ] Je n'ai pas de secret dans mes fichiers
[ ] ESLint passe
[ ] Les tests passent
[ ] Le build passe
[ ] Les nouveaux composants sont testés si nécessaire
[ ] Mon commit est explicite
[ ] La PR décrit clairement les changements
```

---

# 23. Checklist du reviewer

```text
[ ] La fonctionnalité correspond à la tâche
[ ] L'architecture est respectée
[ ] Les fichiers sont correctement organisés
[ ] Le code est lisible
[ ] Les composants sont suffisamment réutilisables
[ ] Les erreurs sont gérées
[ ] Les états loading/error/empty sont présents
[ ] Les tests sont suffisants
[ ] Aucun secret n'est présent
[ ] Le CI est vert
```

---

# 24. Workflow complet à retenir

Chaque fonctionnalité doit suivre exactement ce cycle :

```text
┌─────────────────────┐
│ 1. Prendre la tâche │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 2. Comprendre       │
│    la fonctionnalité│
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 3. Pull develop     │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 4. Créer une branche│
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 5. Développer       │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 6. Écrire les tests │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 7. Lint + Tests +   │
│    Build            │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 8. Push             │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 9. Pull Request     │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 10. CI              │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 11. Code Review     │
└──────────┬──────────┘
           ↓
      ┌────┴────┐
      │         │
    Refusée   Validée
      │         │
      ↓         ↓
   Corriger   Merge
                │
                ↓
             develop
```

---

# 25. Règle d'or de l'équipe

> **Une personne travaille sur une fonctionnalité, une branche représente cette fonctionnalité, une Pull Request représente cette fonctionnalité et le CI garantit qu'elle fonctionne avant son intégration.**

Le but n'est pas d'empêcher les développeurs de travailler rapidement.

Le but est de faire en sorte que **trois développeurs puissent travailler simultanément sans se bloquer mutuellement**.

---

# 26. Résumé opérationnel

### Développeur

```bash
git checkout develop
git pull origin develop

git checkout -b feature/frontend-ma-feature

# développement

npm run lint
npm run test:run
npm run build

git add .
git commit -m "feat(module): description"
git push -u origin feature/frontend-ma-feature
```

Puis :

```text
Pull Request
     ↓
CI
     ↓
Review
     ↓
Approval
     ↓
Merge → develop
```

### Équipe

```text
3 développeurs
      ↓
3 domaines de responsabilité
      ↓
branches indépendantes
      ↓
PR courtes
      ↓
CI obligatoire
      ↓
review obligatoire
      ↓
develop stable
```

Cette procédure constitue le workflow standard de développement Frontend de POSTrack.
