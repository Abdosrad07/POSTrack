# Structure du dépôt et recommandations d'organisation

Ce document décrit l'organisation actuelle de la branche, les observations principales
et des recommandations/priorités pour la réorganisation. Il sert de base pour une PR
unique contenant les changements de structure (si validée par l'équipe).

## 1. Aperçu rapide

Racine notable :

- `backend/` : API FastAPI, modèles SQLAlchemy, migrations Alembic, scripts d'import
- `frontend/` : application React / Vite + composants, pages, services
- `database/` : scripts SQL, seed, docs de la DB
- `data/` : (dumps, exports) — usage ponctuel
- `docs/` : documentation générale (actuellement peu remplie)
- fichiers racine : `README.md`, `alembic.ini`, `package.json`, etc.

## 2. Observations issues de l'inspection

- Le backend est déjà bien structuré : `app/` contient `models/`, `api/`, `crud/`, `schemas/`, `services/`.
- Les scripts d'import et de seed sont sous `backend/scripts/` et utilisent la base SQLite `postrack.db` locale.
- Les migrations Alembic sont correctement configurées (`alembic/env.py` importe `app.models`).
- Le frontend a une architecture standard `src/components`, `src/pages`, `src/services` mais il existe des fichiers vides ou doublons (`pages/partenaires` vide vs `pages/PartnersList.tsx`) et des noms incohérents (JSX/TSX mélangés).
- Il y a des fichiers CSV/rapport et des imports Excel dans `backend/scripts` et `database/imports` — vérifier qu'aucun fichier sensible n'est commité.

## 3. Recommandations (priorité & actions proposées)

1) Documentation (déjà ajoutée) — objectif : centraliser l'arborescence et les commandes de démarrage.

2) Nettoyage frontend (faible risque) — regrouper/normaliser :
   - supprimer ou compléter les fichiers vides sous `frontend/src/pages/*` ou les marquer `TODO`.
   - unifier l'usage TypeScript vs JavaScript (choisir TSX pour les pages critiques si l'équipe veut migrer).
   - renommer `PartnersList` vs `partenaires` pour cohérence (lowercase directories: `partenaires/PartnersList.tsx`).

3) Standardiser scripts et seed (moyen risque) — actions :
   - conserver les scripts d'import dans `backend/scripts/` (ok).
   - s'assurer que `database/seed.sql` est la source de vérité et que `backend/scripts/import_database.py` documente les assomptions.

4) Git & CI :
   - ajouter un fichier `docs/STRUCTURE.md` (celui-ci) et lier depuis le README principal.
   - proposer une PR unique listant les `git mv`/déplacements et scripts de nettoyage afin de garder l'historique.

## 4. Exemple de commandes pour appliquer les changements (local / Git)

Exemples de commandes à exécuter dans la racine du dépôt :

```bash
# Créer un environnement Python pour backend
python -m venv .venv
. .venv/bin/activate   # Windows PowerShell: .\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt

# Appliquer les migrations (depuis la racine ou backend/)
cd backend
alembic upgrade head

# Propositions de renommage (valider avant d'exécuter)
git mv frontend/src/pages/PartnersList.tsx frontend/src/pages/partenaires/PartenairesList.tsx
git mv frontend/src/pages/pos/POSListPage.jsx frontend/src/pages/pos/POSListPage.tsx  # si migration TS

# Vérifier et commit
git add -A
git commit -m "chore(docs): add repo structure + chore(repo): normalize frontend layout"
git push origin feature/reorg-structure
```

## 5. Checklist pour une PR de réorganisation

- [ ] Ajouter `docs/STRUCTURE.md` (ce fichier)
- [ ] Lister les `git mv` effectués dans la description de la PR
- [ ] Vérifier que `backend` démarre et que `alembic upgrade head` fonctionne
- [ ] Vérifier que le `frontend` démarre (`npm install` puis `npm run dev`) — corriger les imports brisés
- [ ] Ajouter tests légers (si déplacement affecte des composants testés)
- [ ] Obtenir l'accord du Lead Backend / Lead Frontend avant merge

## 6. Prochaines étapes que je peux faire maintenant

- Rédiger et soumettre une PR candidate qui :
  - ajoute ce fichier (fait),
  - propose une liste de `git mv` pour normaliser les dossiers frontend,
  - supprime ou archive les fichiers vides.
- Ou uniquement produire un plan détaillé des `git mv` à appliquer (préférable si vous souhaitez valider avant exécution).

---

Si vous voulez, je peux :
- générer automatiquement la liste des fichiers à renommer/archiver et préparer la PR, ou
- appliquer directement les `git mv` et commiter dans une branche `feature/reorg-structure` (il me faudra votre confirmation).

Merci de me dire quelle option vous préférez.
