# Feature Workflow — Frontend

## 1. Prendre connaissance de la tâche

Avant de coder :

- comprendre précisément la fonctionnalité ;
- identifier le module concerné ;
- vérifier les écrans et composants nécessaires ;
- vérifier les éventuelles dépendances avec le Backend ;
- vérifier que la fonctionnalité appartient bien à sa zone de responsabilité.

---

## 2. Mettre `develop` à jour

Toujours commencer avec une branche `develop` à jour :

```bash
git checkout develop
git pull origin develop
```

---

## 3. Créer une branche

Créer une branche dédiée à la fonctionnalité :

```bash
git checkout -b feature/frontend-nom-fonctionnalite
```

Exemple :

```bash
git checkout -b feature/frontend-pos-form
```

**Ne jamais développer directement sur `develop`.**

---

## 4. Développer

Construire la fonctionnalité dans les dossiers correspondant à son module.

Respecter :

- l'architecture du projet ;
- les conventions de nommage ;
- les composants réutilisables ;
- la séparation `pages / components / services` ;
- la gestion des états `loading`, `error`, `empty` et `success`.

Si le Backend n'est pas encore disponible, utiliser temporairement des données mockées.

---

## 5. Tester localement

Avant de créer la PR :

```bash
npm run lint
npm run test:run
npm run build
```

Les trois commandes doivent réussir.

Pour une fonctionnalité importante, vérifier également manuellement son fonctionnement dans le navigateur.

---

## 6. Vérifier les changements

Avant le commit :

```bash
git status
git diff
```

Vérifier que :

- seuls les fichiers nécessaires ont été modifiés ;
- aucun fichier sensible n'est présent ;
- aucun `console.log()` de debug inutile n'a été laissé ;
- aucune clé API, token ou mot de passe n'est présent.

---

## 7. Faire un commit

Utiliser un message explicite :

```bash
git add .
git commit -m "feat(module): description"
```

Exemple :

```bash
git commit -m "feat(pos): add POS creation form"
```

---

## 8. Envoyer la branche

```bash
git push -u origin feature/frontend-pos-form
```

---

## 9. Créer la Pull Request

Sur GitHub :

```text
feature/frontend-pos-form
            ↓
         develop
```

### Titre

Utiliser un titre clair :

```text
feat(pos): add POS creation form
```

### Description

GitHub utilise automatiquement :

```text
.github/PULL_REQUEST_TEMPLATE.md
```

Remplir toutes les sections pertinentes.

---

## 10. Attendre le CI

Le CI vérifie automatiquement :

```text
npm ci
   ↓
ESLint
   ↓
Vitest
   ↓
Vite Build
```

### CI vert

```text
✅ Ready for review
```

La PR peut être reviewée.

### CI rouge

```text
❌ Checks failed
```

Corriger les problèmes avant le merge.

---

## 11. Code Review

Un autre membre de l'équipe examine la PR.

Le reviewer vérifie :

- la fonctionnalité ;
- l'architecture ;
- la qualité du code ;
- les tests ;
- la gestion des erreurs ;
- l'interface ;
- l'absence de modifications inutiles.

Si des modifications sont demandées :

```bash
git add .
git commit -m "fix(module): address review comments"
git push
```

La PR est automatiquement mise à jour.

---

## 12. Merge

Une PR peut être fusionnée dans `develop` lorsque :

```text
✅ Fonctionnalité terminée
✅ Tests locaux réussis
✅ CI vert
✅ Code review effectuée
✅ Approbation obtenue
```

Après le merge :

```bash
git checkout develop
git pull origin develop
```

La branche de fonctionnalité peut ensuite être supprimée.

---

# ⚡ Résumé à retenir

```text
1. Comprendre la tâche
        ↓
2. Pull develop
        ↓
3. Créer feature/...
        ↓
4. Développer
        ↓
5. Lint + Tests + Build
        ↓
6. Commit
        ↓
7. Push
        ↓
8. Pull Request → develop
        ↓
9. CI
        ↓
10. Code Review
        ↓
11. Corrections si nécessaire
        ↓
12. Merge → develop
```

> **Une fonctionnalité = une branche = une PR = une review = un merge.**
