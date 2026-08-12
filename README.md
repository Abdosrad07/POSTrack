# POSTrack Frontend Context

> **Document de référence pour les développeurs Frontend et les assistants IA**

**Projet :** POSTrack
**Version :** 1.0
**Stack :** React + Vite + Tailwind CSS
**Backend :** FastAPI + SQLAlchemy + Pydantic
**Base de données :** MySQL
**Durée MVP :** 14 jours
**Équipe Frontend :** 3 développeurs

---

# 1. Pourquoi ce document existe

Ce document définit le **contexte permanent du Frontend POSTrack**.

Il a deux objectifs :

1. permettre à n'importe quel développeur de comprendre rapidement le projet ;
2. permettre à une IA de comprendre le projet avant de générer, modifier ou analyser du code.

Une IA ne doit pas considérer POSTrack comme une simple application CRUD.

POSTrack possède une logique métier précise, une hiérarchie d'acteurs et des règles qui doivent rester cohérentes dans toute l'application.

Avant toute modification importante, le développeur ou l'IA doit donc consulter ce document.

---

# 2. L'identité de POSTrack

## 2.1 Qu'est-ce que POSTrack ?

POSTrack est une plateforme web destinée au **pilotage et au suivi du réseau de distribution de POS**.

La chaîne fonctionnelle fondamentale est :

```text
PARTENAIRE
     │
     ▼
    DSM
     │
     ▼
    POS
     │
     ▼
   CLIENT
```

Les Partenaires exploitent également des BTS.

POSTrack doit donc permettre de passer d'une vision globale du réseau à une vision opérationnelle détaillée.

---

# 3. L'idée centrale du projet

Le Frontend doit permettre à un utilisateur de comprendre rapidement :

```text
Qui possède quoi ?
        ↓
Qui supervise quoi ?
        ↓
Quels POS existent ?
        ↓
Quels POS sont nouveaux ?
        ↓
Quels POS sont reconduits ?
        ↓
Quels clients sont rattachés ?
        ↓
Quelles primes sont éligibles ?
        ↓
Quel est l'état opérationnel du réseau ?
```

La hiérarchie :

```text
Partenaire → DSM → POS → Client
```

n'est donc pas seulement une relation de base de données.

Elle constitue **l'une des principales façons de naviguer dans l'application**.

---

# 4. La règle métier la plus importante

## NOUVEAU ≠ RECONDUIT

Un POS possède un type :

```text
NOUVEAU
RECONDUIT
```

### POS NOUVEAU

Un POS est considéré comme nouveau s'il n'a jamais fait l'objet d'une reconduction.

Il peut être éligible à une prime.

### POS RECONDUIT

Un POS ayant fait l'objet d'au moins une reconduction devient :

```text
RECONDUIT
```

Il est définitivement inéligible aux primes.

### Conséquence Frontend

L'interface ne doit jamais présenter :

```text
NOUVEAU
RECONDUIT
```

comme deux simples filtres visuels.

Cette distinction possède une **signification métier**.

Elle doit être visible dans :

* les tableaux ;
* les détails POS ;
* les formulaires ;
* les historiques ;
* les dashboards ;
* les primes ;
* les messages de validation.

---

# 5. Cycle de vie d'un POS

Les statuts POS sont :

```text
ACTIF
SUSPENDU
RENOUVELLEMENT
CLOTURE
```

Le type du POS est indépendant :

```text
NOUVEAU
RECONDUIT
```

Il faut donc distinguer :

### Statut

> Où en est actuellement le POS ?

### Type

> Quelle est son histoire commerciale concernant la reconduction ?

Exemple :

```text
POS-001

Statut : ACTIF
Type   : NOUVEAU
```

ou :

```text
POS-001

Statut : ACTIF
Type   : RECONDUIT
```

Ne jamais confondre les deux notions dans les composants React.

---

# 6. Reconductions

Une reconduction représente le **renouvellement du contrat d'un POS**.

Chaque reconduction doit être historisée.

Le Frontend doit donc privilégier une représentation permettant de comprendre :

```text
POS
 │
 ├── Création
 │
 ├── Reconduction 1
 │
 ├── Reconduction 2
 │
 └── État actuel
```

L'historique ne doit pas être remplacé par une simple valeur écrasée.

---

# 7. Primes

Une prime est une récompense financière liée à la création d'un POS Nouveau.

Elle suit un cycle de statut :

```text
EN_ATTENTE
     ↓
VALIDEE
     ↓
PAYEE
```

avec également :

```text
REJETEE
```

Le Frontend doit toujours afficher clairement le statut de la prime.

### Règle fondamentale

Un POS reconduit ne doit pas pouvoir bénéficier d'une nouvelle prime.

Cette règle doit être respectée :

* dans les formulaires ;
* dans les boutons d'action ;
* dans les tableaux ;
* dans les détails ;
* dans les messages d'erreur ;
* dans les dashboards.

Le Frontend ne doit cependant pas être considéré comme l'autorité métier finale : la validation définitive appartient au Backend.

---

# 8. Chaîne Client

Un Client est enregistré au niveau d'un POS.

La relation fondamentale est :

```text
Partenaire
    ↓
DSM
    ↓
POS
    ↓
Client
```

Le Frontend doit permettre de naviguer facilement dans cette hiérarchie.

Exemple :

```text
Partenaire ABC
   └── DSM Douala Centre
        └── POS POS-001
             ├── Client A
             ├── Client B
             └── Client C
```

---

# 9. SIM

Le MVP prévoit un suivi simplifié du stock de SIM.

Chaque SIM est identifiée par son :

```text
ICCID
```

et peut posséder un statut :

```text
EN_STOCK
VENDUE
ACTIVEE
DEFECTUEUSE
RETOURNEE
```

Une SIM peut être associée à :

```text
POS
Client
```

Le cycle de vie avancé des SIM est hors périmètre du MVP.

Ne pas implémenter spontanément :

* activation opérateur en temps réel ;
* portabilité ;
* KYC documentaire ;
* intégration avec un système externe d'activation.

Ces éléments appartiennent à une évolution future.

---

# 10. BTS

Les Partenaires exploitent des BTS.

Une BTS possède notamment un statut :

```text
ACTIF
MAINTENANCE
HORS_SERVICE
```

Les relevés BTS permettent de suivre notamment :

* la charge ;
* le taux de saturation ;
* le rendement ;
* la date du relevé.

Le dashboard peut ensuite exploiter ces données.

---

# 11. Requêtes

Une requête représente une demande ou un problème opérationnel.

Statuts :

```text
OUVERTE
EN_COURS
RESOLUE
FERMEE
```

Priorités :

```text
BASSE
NORMALE
HAUTE
URGENTE
```

Types :

```text
APPROVISIONNEMENT_SIM
MAINTENANCE_BTS
RECLAMATION_CLIENT
SUPPORT_POS
AUTRE
```

Le Frontend doit rendre visibles à la fois :

```text
Type
Priorité
Statut
```

et permettre leur filtrage lorsque cela est pertinent.

---

# 12. Rôles utilisateurs

POSTrack utilise quatre rôles :

```text
ADMIN
MANAGER
DSM
VIEWER
```

## ADMIN

Accès complet.

Peut notamment :

* gérer les utilisateurs ;
* supprimer ;
* consulter l'audit ;
* valider les primes.

## MANAGER

Peut gérer :

```text
Partenaires
DSM
BTS
POS
Clients
SIM
Requêtes
```

et consulter les dashboards.

## DSM

Possède une portée limitée à sa zone.

Peut consulter et mettre à jour :

```text
POS
Clients
SIM
Requêtes
```

de sa propre zone de couverture.

## VIEWER

Lecture seule.

---

# 13. Règle de sécurité Frontend

Le Frontend doit adapter l'interface au rôle de l'utilisateur.

Exemple :

```text
ADMIN
 ├── Voir
 ├── Créer
 ├── Modifier
 ├── Supprimer
 └── Valider prime

VIEWER
 └── Voir
```

Mais :

> **Le Frontend ne constitue jamais la seule couche de sécurité.**

Masquer un bouton n'est pas une protection suffisante.

Le Backend doit toujours vérifier les permissions.

Le Frontend doit simplement fournir une expérience cohérente avec les permissions retournées par le système.

---

# 14. Architecture technique globale

POSTrack suit une architecture 3-tiers :

```text
┌──────────────────────────────┐
│          FRONTEND            │
│       React + Vite           │
│                              │
│ Pages                        │
│ Components                   │
│ Contexts                     │
│ Hooks                        │
│ Services                     │
└──────────────┬───────────────┘
               │
             Axios
               │
               ▼
┌──────────────────────────────┐
│           BACKEND            │
│           FastAPI            │
│                              │
│ Routes                       │
│ Services métier              │
│ Pydantic                     │
│ JWT                          │
│ SQLAlchemy                   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│            MYSQL             │
│        postrack_db           │
└──────────────────────────────┘
```

Le Frontend ne communique pas directement avec MySQL.

---

# 15. Architecture Frontend

Le Frontend est organisé autour des responsabilités suivantes :

```text
src/
│
├── pages/
│
├── components/
│
├── services/
│
├── context/
│
├── hooks/
│
├── routes/
│
├── utils/
│
├── mocks/
│
├── assets/
│
├── App.jsx
├── main.jsx
└── index.css
```

L'architecture détaillée déjà créée dans le dépôt constitue la structure de référence.

**Ne pas recréer ou déplacer l'architecture sans décision de l'équipe.**

---

# 16. Responsabilité des couches

## Pages

Les pages représentent les écrans de l'application.

Exemple :

```text
POSListPage
POSCreatePage
POSDetailPage
```

Une page orchestre les composants nécessaires.

---

## Components

Les composants représentent les éléments d'interface réutilisables ou spécifiques à un domaine.

Exemple :

```text
POSForm
POSTable
StatusBadge
```

---

## Services

Les services encapsulent les appels API.

Exemple :

```text
posService
primeService
clientService
simService
```

Une page ne doit pas disperser des appels Axios directement partout.

Préférer :

```text
POSListPage
     ↓
posService
     ↓
Axios
     ↓
FastAPI
```

---

## Context

Les Contexts servent aux informations globales.

Exemple :

```text
AuthContext
```

---

## Hooks

Les hooks servent à encapsuler des comportements réutilisables.

Exemple :

```text
useAuth()
usePagination()
useDebounce()
```

---

## Routes

Le routing doit centraliser :

* les routes ;
* les routes protégées ;
* les permissions nécessaires lorsque cela est pertinent.

---

# 17. Flux de données Frontend

Le flux standard est :

```text
Utilisateur
     ↓
Page
     ↓
Component
     ↓
Service
     ↓
Axios
     ↓
FastAPI
     ↓
Réponse JSON
     ↓
Service
     ↓
Page / Component
     ↓
Utilisateur
```

Ne pas inverser les responsabilités.

---

# 18. Gestion des états d'interface

Toute page qui communique avec l'API doit réfléchir aux états suivants :

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
Données disponibles
    ↓
Affichage
```

ou :

```text
Chargement
    ↓
Aucune donnée
    ↓
EmptyState
```

ou :

```text
Chargement
    ↓
Erreur API
    ↓
Message d'erreur + possibilité de réessayer
```

L'utilisateur doit toujours comprendre ce qui se passe.

---

# 19. Philosophie UI

POSTrack est un outil de gestion opérationnelle.

L'interface doit donc privilégier :

* clarté ;
* lisibilité ;
* rapidité ;
* hiérarchie visuelle ;
* densité raisonnable d'information ;
* feedback immédiat ;
* cohérence.

Il ne faut pas transformer POSTrack en site vitrine ou en interface excessivement décorative.

---

# 20. Dashboard

Le dashboard doit aider à répondre rapidement à des questions opérationnelles.

Exemples :

```text
Combien de POS ?
Combien de POS nouveaux ?
Combien de POS reconduits ?
Combien de primes en attente ?
Combien de primes validées ?
Quel est l'état des BTS ?
Quel est l'état des requêtes ?
Quel est l'état du stock SIM ?
```

Les graphiques doivent servir la compréhension des données.

Ne pas ajouter un graphique simplement parce que Recharts est disponible.

---

# 21. Responsive

Le cahier des charges exige une interface adaptée au :

```text
Desktop
Tablette
```

Le Frontend doit donc éviter les interfaces qui ne fonctionnent que sur un écran large.

---

# 22. Stack Frontend officielle

```text
React
Vite
Tailwind CSS
Axios
React Router
Vitest
React Testing Library
Recharts
```

Le choix React + Vite est lié au délai court du projet et Tailwind permet aux trois développeurs de conserver une interface cohérente sans designer dédié.

---

# 23. Règles de développement

## Règle 1

Ne pas réinventer une fonctionnalité déjà présente.

Avant de créer :

```text
Button
Modal
Table
Badge
Input
```

chercher d'abord si elle existe.

---

## Règle 2

Les composants communs doivent rester génériques.

Mauvais :

```text
POSTable
```

dans `components/Common/`.

Correct :

```text
components/Common/Table/
```

et :

```text
components/POS/POSTable/
```

si le composant POS possède une logique spécifique.

---

## Règle 3

La logique métier complexe appartient au Backend.

Le Frontend peut :

* afficher ;
* guider ;
* valider les entrées ;
* empêcher certaines actions évidentes ;
* afficher les erreurs.

Mais il ne doit pas devenir l'autorité métier.

---

# 24. Ce que le Frontend ne doit pas inventer

Ne pas inventer :

* des rôles supplémentaires ;
* des statuts supplémentaires ;
* des règles de prime ;
* des transitions métier ;
* des endpoints ;
* des champs API ;
* des relations entre entités ;
* des fonctionnalités V2.

Si une information manque :

```text
1. consulter la documentation ;
2. consulter le Backend ;
3. demander au Lead ;
4. ne pas inventer.
```

---

# 25. MVP vs V2

Le MVP doit rester limité.

## P0 — indispensable

```text
Authentification
Partenaires
DSM
POS
Nouveau / Reconduit
Reconductions
Primes
Clients
BTS CRUD
```

## P1 — important

```text
Relevés BTS
Stock SIM
Requêtes
Dashboard / Analytics
Import / Export Excel
Audit
```

## P2 — souhaitable

```text
Notifications
```

---

# 26. Fonctionnalités explicitement hors MVP

Ne pas développer spontanément :

```text
2FA
OAuth externe
WebSockets
Activation SIM temps réel
Portabilité SIM
KYC documentaire
Paiement réel des primes
Monitoring BTS temps réel
Réplication MySQL multi-agences
Application mobile
Cartographie interactive
```

Ces éléments appartiennent aux perspectives d'évolution.

---

# 27. Principes de cohérence entre Backend et Frontend

Pour chaque module :

```text
Backend
   │
   ├── Model
   ├── Schema
   ├── CRUD
   ├── Service
   └── API
        │
        ▼
Frontend
   │
   ├── Service API
   ├── Page
   ├── Components
   └── Tests
```

Le nommage doit rester aussi cohérent que possible.

Exemple :

```text
Backend:
pos.py
pos_service.py
/api/pos

Frontend:
posService.js
POSListPage.jsx
POSForm.jsx
```

---

# 28. Travail avec des données mockées

Le Frontend peut utiliser des mocks lorsque l'API n'est pas encore disponible.

Exemple :

```text
mocks/
└── pos.js
```

Mais un mock doit représenter la structure attendue par l'API.

Ne pas créer un objet mocké arbitraire qui ne correspondra jamais au Backend.

---

# 29. Collaboration entre les trois développeurs

L'équipe Frontend est organisée en trois responsabilités.

## Lead Frontend

```text
Architecture React
Routing
État global
Partenaires
DSM
BTS
Core
```

## Cycle de vie POS

```text
POS
Reconductions
Primes
```

## Chaîne Client

```text
Clients
Stock SIM
Requêtes
Dashboard
Import/Export
```

Cette séparation permet aux trois développeurs de travailler en parallèle.

---

# 30. Règle de propriété du code

Un développeur est responsable de son domaine mais **le projet appartient à toute l'équipe**.

Donc :

```text
Responsable ≠ propriétaire exclusif
```

Un développeur peut demander de l'aide sur n'importe quel module.

Mais les modifications de l'architecture commune doivent être coordonnées.

---

# 31. Git

Structure :

```text
main
  │
  └── develop
       │
       ├── feature/...
       ├── bugfix/...
       └── hotfix/...
```

Une fonctionnalité doit être développée sur sa propre branche.

Convention :

```text
feature/<module>-<action>
```

Exemples :

```text
feature/pos-list
feature/pos-form
feature/reconductions
feature/primes
feature/clients
feature/sims-stock
feature/requetes
```

---

# 32. Pull Request

Une Pull Request doit :

* être ciblée ;
* expliquer les changements ;
* contenir les tests nécessaires ;
* passer le CI ;
* être revue avant merge.

Le flux est :

```text
feature
   ↓
Pull Request
   ↓
CI
   ↓
Code Review
   ↓
Approval
   ↓
develop
```

---

# 33. CI

Le CI Frontend doit vérifier au minimum :

```bash
npm ci
npm run lint
npm run test:run
npm run build
```

Une PR qui échoue au CI ne doit pas être considérée comme prête à merger.

---

# 34. Tests Frontend

Les tests Frontend utilisent :

```text
Vitest
React Testing Library
```

Les composants particulièrement critiques comprennent :

```text
POSForm
ReconductionPage
PrimeForm
SimsStockPage
```

Toute modification de la logique `NOUVEAU/RECONDUIT` ou des primes doit être accompagnée d'un test automatisé.

---

# 35. Règles pour les IA

Cette section est particulièrement importante.

Toute IA utilisée sur POSTrack doit considérer ce document comme son **contexte permanent**.

Avant de générer du code, l'IA doit comprendre :

```text
POSTrack
    ↓
Chaîne de distribution
    ↓
Partenaire → DSM → POS → Client
```

et :

```text
POS
 ├── NOUVEAU
 │     └── éligible à une prime
 │
 └── RECONDUIT
       └── définitivement inéligible aux primes
```

---

# 36. Instructions générales pour une IA

Lorsqu'une IA intervient sur POSTrack, elle doit respecter les règles suivantes :

### 1. Ne pas réinventer l'architecture

Utiliser l'architecture existante.

### 2. Ne pas inventer d'API

Si l'endpoint n'est pas connu, demander ou consulter la documentation Backend.

### 3. Ne pas inventer de données

Respecter les modèles existants.

### 4. Ne pas inventer de règles métier

En particulier :

```text
Nouveau / Reconduit
Primes
Rôles
Permissions
Statuts
```

### 5. Respecter les responsabilités

Une page ne doit pas devenir un énorme fichier contenant :

```text
UI
API
validation
état global
logique métier
```

### 6. Préserver les composants réutilisables

Avant de créer un nouveau composant, chercher un composant existant.

### 7. Ne pas modifier inutilement des fichiers

Une IA doit limiter son intervention à ce qui est nécessaire.

---

# 37. Prompt système recommandé pour les IA

Le texte suivant peut être fourni à Claude, Gemini, ChatGPT, Copilot, Cursor, Roo Code ou toute autre IA utilisée sur le projet :

```text
Tu travailles sur POSTrack.

POSTrack est une plateforme web de pilotage et de suivi d'un réseau de distribution de POS.

La chaîne fonctionnelle centrale est :

Partenaire → DSM → POS → Client

Les Partenaires exploitent également des BTS.

La règle métier la plus importante du projet est la distinction entre POS NOUVEAU et POS RECONDUIT.

Un POS NOUVEAU n'a jamais fait l'objet d'une reconduction et peut être éligible à une Prime.

Un POS RECONDUIT a fait l'objet d'au moins une reconduction et est définitivement inéligible aux primes.

Ne modifie jamais cette règle sans instruction explicite.

Le Frontend utilise React + Vite + Tailwind CSS.

L'API est développée avec FastAPI.

Les communications Frontend/Backend utilisent Axios et REST/JSON.

L'authentification utilise JWT.

Les rôles sont :
ADMIN
MANAGER
DSM
VIEWER

Le Frontend est organisé en :
pages
components
services
context
hooks
routes
utils
mocks

Respecte l'architecture existante du dépôt.

Ne crée pas une nouvelle architecture si une structure existe déjà.

Avant de créer un composant, vérifie si un composant réutilisable existe.

Avant d'inventer un endpoint, un champ ou un statut, vérifie la documentation ou le code Backend.

Ne déplace pas de fichiers et ne refactore pas l'architecture sans nécessité.

Ne mélange pas la logique métier Backend avec la présentation Frontend.

Les pages orchestrent les composants.
Les services gèrent les appels API.
Les contextes gèrent les états globaux.
Les hooks encapsulent les comportements réutilisables.
Les composants gèrent principalement l'interface et les interactions.

Toutes les pages connectées à l'API doivent gérer les états :
loading
success
empty
error

L'interface doit être responsive Desktop/Tablette, claire et orientée gestion opérationnelle.

Ne développe pas de fonctionnalités V2 sans demande explicite.

Le MVP ne comprend notamment pas :
2FA
OAuth externe
WebSockets
activation SIM temps réel
portabilité SIM
KYC documentaire
paiement réel des primes
monitoring BTS temps réel
application mobile
cartographie interactive

Lorsque tu proposes du code :
1. respecte l'architecture existante ;
2. explique brièvement les fichiers modifiés ;
3. limite les modifications au strict nécessaire ;
4. n'écrase pas du code existant sans justification ;
5. ajoute ou adapte les tests lorsque la fonctionnalité est critique ;
6. vérifie la cohérence avec les règles métier POSTrack.

Si une information importante manque, ne l'invente pas.
Signale précisément ce qui manque et demande une clarification.
```

---

# 38. Comment utiliser ce document avec une IA de développement

Avant une tâche importante :

```text
1. Lire FRONTEND_CONTEXT.md
2. Lire la tâche
3. Examiner le code existant
4. Identifier les fichiers concernés
5. Proposer le plan
6. Attendre validation si modification architecturale
7. Implémenter
8. Tester
```

Pour une petite tâche :

```text
Contexte
   ↓
Fichier concerné
   ↓
Modification minimale
   ↓
Test
```

---

# 39. Règle concernant les modifications architecturales

Une IA ne doit pas décider seule de :

```text
renommer un dossier
déplacer plusieurs modules
changer la structure globale
changer la stratégie de routing
changer la gestion globale de l'état
changer la stratégie API
ajouter une nouvelle librairie majeure
```

Ces décisions nécessitent une validation du Lead Frontend.

---

# 40. Règle concernant les dépendances

Avant d'ajouter :

```bash
npm install nouvelle-librairie
```

le développeur ou l'IA doit se demander :

```text
Est-elle réellement nécessaire ?
Existe-t-il déjà une solution dans le projet ?
Quel est son impact sur le bundle ?
Est-elle compatible avec la stack ?
```

L'ajout d'une dépendance majeure doit être discuté avec le Lead.

---

# 41. Règle concernant l'UI

Une fonctionnalité n'est pas terminée uniquement parce que son API fonctionne.

Elle doit également gérer :

```text
chargement
succès
absence de données
erreur
validation
confirmation
```

Exemple :

```text
Création POS
    ↓
Formulaire
    ↓
Validation
    ↓
Loading
    ↓
Succès
    ↓
Notification
    ↓
Actualisation de la liste
```

---

# 42. Règle concernant les erreurs

Ne jamais afficher à l'utilisateur une erreur technique brute lorsqu'un message compréhensible peut être présenté.

Mauvais :

```text
AxiosError: Request failed with status code 422
```

Préférer :

```text
Impossible d'enregistrer le POS.
Veuillez vérifier les informations saisies.
```

Les détails techniques peuvent rester disponibles dans les logs de développement.

---

# 43. Règle concernant les formulaires

Les formulaires doivent :

* valider les données ;
* afficher les erreurs près des champs concernés ;
* empêcher les soumissions incohérentes ;
* afficher un état de chargement ;
* empêcher les doubles soumissions ;
* informer l'utilisateur du résultat.

---

# 44. Règle concernant les tableaux

Les tableaux doivent prévoir lorsque nécessaire :

```text
Pagination
Recherche
Filtres
Tri
État vide
Chargement
Erreur
Actions
```

Mais il ne faut pas ajouter toutes ces fonctionnalités automatiquement.

Elles doivent répondre au besoin réel de la page.

---

# 45. Règle concernant les badges

Les badges servent principalement à rendre les statuts immédiatement compréhensibles.

Exemples :

```text
ACTIF
SUSPENDU
CLOTURE
NOUVEAU
RECONDUIT
EN_ATTENTE
VALIDEE
PAYEE
REJETEE
```

Le composant `Badge` doit rester générique.

La correspondance statut → présentation peut être centralisée.

---

# 46. Règle concernant les dashboards

Un dashboard doit répondre à des questions métier.

Il ne doit pas être une collection de graphiques décoratifs.

Chaque indicateur doit avoir une signification opérationnelle.

---

# 47. Definition of Done

Une fonctionnalité Frontend est considérée comme terminée lorsque :

```text
[ ] Fonctionnalité implémentée
[ ] Architecture respectée
[ ] API correctement intégrée
[ ] Loading géré
[ ] Empty state géré
[ ] Erreurs gérées
[ ] Validation présente si nécessaire
[ ] Tests écrits si nécessaire
[ ] npm run lint OK
[ ] npm run test:run OK
[ ] npm run build OK
[ ] Aucun secret ajouté
[ ] Code review terminée
[ ] CI vert
[ ] PR approuvée
```

---

# 48. Ce que POSTrack doit toujours donner comme impression

POSTrack doit donner l'impression d'un **outil professionnel de pilotage opérationnel**.

L'utilisateur doit pouvoir :

```text
comprendre
    ↓
naviguer
    ↓
agir
    ↓
recevoir un retour
    ↓
suivre le résultat
```

L'interface doit être sérieuse, structurée et orientée données.

---

# 49. Les trois questions que chaque développeur doit se poser

Avant de coder :

> **Où cette fonctionnalité appartient-elle ?**

Pendant le développement :

> **Est-ce cohérent avec la logique métier de POSTrack ?**

Avant la PR :

> **Est-ce que mon changement améliore le projet sans casser ce qui existe déjà ?**

---

# 50. Les trois questions qu'une IA doit se poser

Avant de modifier le code :

> **Quelle est la responsabilité exacte de ce fichier ?**

> **Existe-t-il déjà un composant ou service permettant de faire cela ?**

> **Cette modification respecte-t-elle les règles métier et l'architecture POSTrack ?**

---

# 51. Sources de vérité

En cas de contradiction, l'équipe doit se référer dans cet ordre :

```text
1. Cahier des charges validé
        ↓
2. Architecture technique validée
        ↓
3. Documentation fonctionnelle
        ↓
4. Code Backend/API réel
        ↓
5. Code Frontend existant
        ↓
6. Décisions explicites de l'équipe
```

Une IA ne doit pas remplacer une décision projet par une supposition.

---

# 52. Résumé de l'âme de POSTrack

```text
                         POSTRACK
                            │
                            ▼
                 PILOTER LE RÉSEAU POS
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
       CHAÎNE DISTRIBUTION            PILOTAGE
             │                             │
             ▼                             ▼
 Partenaire → DSM → POS → Client     Dashboard
             │                       Primes
             │                       BTS
             │                       SIM
             │                       Requêtes
             │
             ▼
       CYCLE DE VIE POS
             │
       ┌─────┴─────┐
       ▼           ▼
    NOUVEAU     RECONDUIT
       │           │
       ▼           ▼
    PRIME       PAS DE PRIME
```

POSTrack n'est donc pas simplement :

```text
Frontend + Backend + Database
```

C'est un système qui doit transformer la chaîne de distribution en une **vision opérationnelle, traçable et exploitable**.

Toute décision Frontend doit rester cohérente avec cette finalité.
