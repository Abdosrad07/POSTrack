# Pull Request — Frontend

## 📋 Description

<!-- Décris brièvement ce que cette PR apporte. -->

### Fonctionnalité

<!-- Exemple : Ajout du formulaire de création d'un POS. -->

-

### Module concerné

- [ ] Core / Architecture
- [ ] Authentification
- [ ] Partenaires
- [ ] DSM
- [ ] BTS
- [ ] POS
- [ ] Reconductions
- [ ] Primes
- [ ] Clients
- [ ] Stock SIM
- [ ] Requêtes
- [ ] Dashboard
- [ ] Import / Export
- [ ] Autre :

---

## 🔧 Modifications effectuées

<!-- Liste les principales modifications réalisées. -->

-
-
-

---

## 🧪 Tests

### Tests automatisés

- [ ] `npm run lint`
- [ ] `npm run test:run`
- [ ] `npm run build`

### Tests fonctionnels

<!-- Décris les scénarios testés manuellement. -->

- [ ] Fonctionnement nominal
- [ ] État de chargement
- [ ] État vide
- [ ] Gestion des erreurs
- [ ] Validation des formulaires
- [ ] Responsive / affichage

### Tests spécifiques

<!-- Si la PR concerne une fonctionnalité critique, préciser les tests réalisés. -->

- [ ] POS / règle NOUVEAU → RECONDUIT
- [ ] Primes
- [ ] Reconductions
- [ ] Stock SIM
- [ ] Autre :

---

## 🏗️ Architecture

- [ ] Les fichiers sont placés dans les dossiers correspondant à leur domaine.
- [ ] Aucun fichier partagé n'a été modifié inutilement.
- [ ] Les composants réutilisables sont placés dans `components/Common/` lorsque nécessaire.
- [ ] Les appels API passent par les services appropriés.
- [ ] Aucun code dupliqué inutilement.

---

## 🔐 Sécurité

- [ ] Aucun mot de passe n'est présent dans le code.
- [ ] Aucune clé API ou token n'est présent dans le code.
- [ ] Aucun fichier `.env` n'est commit.
- [ ] Aucune donnée sensible n'a été ajoutée au dépôt.

---

## 🔀 Git

- [ ] Ma branche part de `develop`.
- [ ] Ma branche respecte la convention `feature/...`, `bugfix/...` ou `hotfix/...`.
- [ ] Mes commits sont explicites.
- [ ] Je n'ai pas modifié le travail d'un autre développeur.
- [ ] J'ai vérifié `git diff` avant de créer la PR.
- [ ] Ma branche est à jour avec `develop` si nécessaire.

---

## 🤝 Code Review

### Points particuliers à vérifier

<!-- Indique ici les parties du code sur lesquelles tu souhaites attirer l'attention du reviewer. -->

-
-

### Reviewer

<!-- Le reviewer sera désigné selon la rotation de l'équipe. -->

- [ ] Code review effectuée
- [ ] Commentaires traités
- [ ] Approbation obtenue

---

## ⚠️ Impacts / Dépendances

<!-- Indique si cette PR dépend d'une API Backend, d'une autre PR ou d'une modification de structure. -->

### Dépendance Backend

- [ ] Aucune
- [ ] API déjà disponible
- [ ] API en cours de développement
- [ ] Nécessite une coordination avec l'équipe Backend

### Autres dépendances

- [ ] Aucune
- [ ] Autre PR : #

---

## 📸 Captures d'écran

<!-- Pour les modifications UI, ajouter des captures avant/après si pertinent. -->

### Avant

<!-- Insérer une capture si nécessaire. -->

### Après

<!-- Insérer une capture si nécessaire. -->

---

## 📝 Notes pour le reviewer

<!-- Informations importantes pour comprendre ou tester la PR. -->

---

## ✅ Checklist finale

- [ ] La fonctionnalité correspond à la tâche demandée.
- [ ] Le code fonctionne localement.
- [ ] Le lint passe.
- [ ] Les tests passent.
- [ ] Le build passe.
- [ ] Le CI est vert.
- [ ] Aucun secret n'est présent dans la PR.
- [ ] Aucun fichier inutile n'est inclus.
- [ ] La documentation a été mise à jour si nécessaire.
- [ ] La PR est suffisamment ciblée pour être reviewée facilement.

---

### 🚦 Décision

- [ ] ✅ Prête à être mergée
- [ ] 🔄 Modifications nécessaires
- [ ] ⏸️ En attente d'une dépendance
