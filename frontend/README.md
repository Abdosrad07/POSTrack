# Documentation Technique — Équipe Frontend

**Projet :** POSTrack
**Version :** 1.0
**Technologies :** React, Vite, Tailwind CSS, Axios, React Router, Recharts

---

# 1. Mission de l'équipe Frontend

L'équipe Frontend est responsable de la conception et du développement de l'interface utilisateur de POSTrack.

Elle doit fournir une interface moderne, ergonomique, responsive et performante permettant aux utilisateurs de manipuler les données du système via les API développées par l'équipe Backend.

Les objectifs principaux sont :

* développer l'ensemble des interfaces utilisateur ;
* intégrer les API REST du Backend ;
* assurer une expérience utilisateur fluide ;
* afficher les données analytiques sous forme graphique ;
* gérer l'authentification et les permissions côté client.

---

# 2. Stack technique

| Technologie       | Utilisation                   |
| ----------------- | ----------------------------- |
| React             | Développement de l'interface  |
| Vite              | Bundler                       |
| React Router      | Navigation                    |
| Axios             | Communication avec les API    |
| Tailwind CSS      | Interface utilisateur         |
| Recharts          | Graphiques                    |
| Context API       | Gestion de l'authentification |
| JavaScript (ES6+) | Développement                 |

---

# 3. Arborescence du projet

```text
frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   │
│   ├── layouts/
│   │
│   ├── pages/
│   │
│   ├── services/
│   │
│   ├── hooks/
│   │
│   ├── context/
│   │
│   ├── routes/
│   │
│   ├── utils/
│   │
│   ├── styles/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
└── vite.config.js
```

---

# 4. Organisation des dossiers

## assets/

Images, logos, icônes, illustrations.

---

## components/

Composants réutilisables.

Exemples :

* Button
* Card
* Modal
* Table
* Loading
* Pagination
* SearchBar
* FilterBar
* Sidebar
* Header
* Footer
* StatCard
* ChartCard

---

## layouts/

Structure générale des pages.

* MainLayout
* AuthLayout

---

## pages/

Pages principales :

* LoginPage
* DashboardPage
* PartenairesListPage
* DSMListPage
* BTSListPage
* POSListPage
* POSDetailPage
* ImportExportPage
* AuditLogsPage
* NotFoundPage

---

## services/

Communication avec le Backend.

Exemples :

* authService.js
* partenaireService.js
* dsmService.js
* btsService.js
* posService.js
* analyticsService.js
* excelService.js

---

## context/

Gestion des états globaux.

* AuthContext
* ThemeContext (optionnel)

---

## hooks/

Hooks personnalisés.

Exemples :

* useAuth()
* usePagination()
* useFetch()
* useDebounce()

---

## routes/

Configuration des routes.

* ProtectedRoute
* Router

---

## utils/

Fonctions utilitaires.

---

# 5. Navigation

```text
Login

↓

Dashboard

├── Partenaires
├── DSM
├── BTS
├── POS
├── Dashboard
├── Import / Export
└── Audit
```

---

# 6. Pages à développer

## Login

Fonctionnalités :

* connexion
* validation
* messages d'erreur

---

## Dashboard

Affiche :

* nombre de partenaires
* nombre de DSM
* nombre de BTS
* nombre de POS
* taux de saturation
* graphiques

---

## Partenaires

* tableau
* pagination
* recherche
* création
* modification
* suppression

---

## DSM

Même fonctionnement.

---

## BTS

Même fonctionnement.

Ajout :

* indicateur de saturation.

---

## POS

Fonctionnalités :

* tableau
* tri
* pagination
* recherche
* filtres
* formulaire
* détails

---

## Import / Export

Fonctionnalités :

* dépôt de fichier Excel
* aperçu
* rapport d'import
* export

---

## Audit

Historique :

* créations
* modifications
* suppressions

---

# 7. Composants réutilisables

## UI

* Button
* Card
* Badge
* Avatar
* Input
* Select
* Checkbox
* Modal
* Toast
* Alert
* Spinner
* Tooltip

---

## Data

* Table
* Pagination
* FilterBar
* SearchBar

---

## Dashboard

* StatCard
* PieChartCard
* BarChartCard
* LineChartCard

---

# 8. Services API

Chaque module possède son propre service.

Exemple :

```text
authService.js

login()

logout()

register()

refreshToken()
```

```text
partenaireService.js

getAll()

getOne()

create()

update()

delete()
```

Même principe pour :

* DSM
* BTS
* POS
* Dashboard
* ImportExport

---

# 9. Gestion de l'authentification

Après connexion :

* stockage du JWT
* ajout automatique dans les requêtes Axios
* vérification des rôles
* redirection automatique si non connecté

---

# 10. Gestion des erreurs

Toutes les erreurs devront être affichées à l'utilisateur.

Exemples :

* formulaire invalide
* erreur API
* erreur serveur
* connexion perdue

---

# 11. Responsive Design

L'application doit être compatible avec :

* ordinateur
* tablette
* smartphone

---

# 12. Conventions

## Nom des composants

PascalCase

Exemple :

```text
DashboardPage.jsx

POSForm.jsx

StatCard.jsx
```

---

## Nom des hooks

camelCase

```text
useAuth()

usePagination()
```

---

## Nom des services

camelCase

```text
authService.js

posService.js
```

---

# 13. Répartition des responsabilités

## Lead Frontend

Responsabilités :

* architecture React
* routage
* gestion de l'authentification
* intégration globale
* revue de code
* validation des Pull Requests

---

## Développeur Frontend 1

Modules :

* Partenaires
* BTS

Développe :

* pages
* formulaires
* tableaux
* intégration API

---

## Développeur Frontend 2

Modules :

* POS
* DSM
* Dashboard
* Import / Export
* Audit

Développe :

* graphiques
* filtres
* tableaux interactifs
* responsive design
* expérience utilisateur

---

# 14. Communication avec les autres équipes

## Équipe Backend

* définition des contrats API ;
* tests des endpoints avec Swagger ;
* validation des formats JSON ;
* résolution des erreurs d'intégration.

## Équipe Base de données

* validation des structures de données ;
* compréhension des relations entre les entités ;
* vérification de la cohérence des informations affichées.

---

# 15. Bonnes pratiques

* Utiliser des composants réutilisables.
* Éviter la duplication de code.
* Respecter l'architecture définie.
* Effectuer des commits fréquents.
* Tester chaque fonctionnalité avant son intégration.
* Documenter les composants complexes.
* Vérifier le responsive avant chaque fusion.
* Synchroniser quotidiennement les travaux avec les équipes Backend et Base de données.

---

# 16. Livrables attendus

À la fin des 14 jours, l'équipe Frontend devra fournir :

* une interface utilisateur complète et responsive ;
* toutes les pages fonctionnelles ;
* l'intégration de l'ensemble des API REST ;
* les tableaux de bord analytiques avec Recharts ;
* les fonctionnalités d'import/export ;
* la gestion des rôles et de l'authentification ;
* un code propre, documenté et maintenable, conforme à l'architecture du projet.
