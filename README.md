# POSTrack — Branche Base de Données

Cette branche regroupe le travail de l'équipe **Base de Données** (3 membres) du projet POSTrack : conception du schéma, scripts de création, jeu de données de test, et documentation associée.

## Contenu de cette branche

```
docs/
├── MCD.drawio          # Modèle Conceptuel de Données (schéma entités/relations)
├── MLD.md               # Modèle Logique de Données (traduction texte du MCD)
└── dictionnaire.md      # Dictionnaire de données (colonnes, types, contraintes)

backend/
├── scripts/
│   ├── init_db.py       # Crée les 6 tables + index
│   └── seed.py           # Peuple la base avec des données de test
├── app/
│   └── database.py       # Connexion SQLAlchemy
└── tests/
    └── test_db_integrity.py   # Tests des contraintes d'intégrité
```

## Schéma de données

6 tables : `users`, `partenaires`, `dsm`, `bts`, `pos`, `audit_logs`.

Relations principales :
- Un **Partenaire** possède plusieurs **POS** et exploite plusieurs **BTS**
- Un **DSM** supervise plusieurs **POS**
- Une **BTS** est toujours rattachée à un Partenaire (jamais directement à un POS)
- Chaque action est journalisée dans **audit_logs**

Voir `docs/MCD.drawio` pour le schéma visuel complet et `docs/dictionnaire.md` pour le détail de chaque colonne.

## Installation

```bash
# Depuis la racine du dépôt
cd backend

python -m venv venv
source venv/bin/activate       # Windows : venv\Scripts\activate

pip install -r requirements.txt
pip install faker              # nécessaire pour seed.py

cp .env.example .env           # renseigner DATABASE_URL
```

## Utilisation

```bash
# 1. Créer le schéma (tables + index)
python scripts/init_db.py

# 2. Peupler avec des données de test
python scripts/seed.py

# 3. Vérifier visuellement (extension SQLite Viewer ou SQLTools dans VS Code)
```

Cela génère `backend/postrack.db` — **ce fichier n'est jamais commité** (voir `.gitignore`). Chaque personne régénère sa propre base localement avec les deux commandes ci-dessus.

## Comptes de démonstration créés par `seed.py`

| Rôle | Email | Mot de passe |
|---|---|---|
| ADMIN | admin@postrack.local | admin123 |
| MANAGER | manager@postrack.local | manager123 |
| DSM | dsm@postrack.local | dsm123 |

## Tests

```bash
pytest backend/tests/test_db_integrity.py
```

Vérifie notamment :
- Rejet d'un POS référençant un `partenaire_id` inexistant
- Unicité de `code_partenaire` et `matricule`
- Contraintes NOT NULL sur les champs obligatoires

## Répartition de l'équipe

| Rôle | Responsable | Fichiers |
|---|---|---|
| Lead — schéma & documentation | — | `docs/` |
| Développeur — données de test | Salem | `scripts/seed.py` |
| Développeur — contraintes & performance | — | `scripts/init_db.py`, `tests/` |

## Workflow Git

- Branches nommées `feature/<module>-<action>` depuis `develop`
- Pull Request obligatoire + revue par un membre d'une autre équipe avant fusion
- Fusion (squash) dans `develop`, puis `develop` → `main` en fin de journée avec livrable validé

Convention de commit :
```
feat(bts): calculer le taux de saturation à la création
fix(pos): corriger la validation du dsm_id
docs(readme): mettre à jour les instructions d'installation
test(dsm): ajouter les tests unitaires du CRUD DSM
```
