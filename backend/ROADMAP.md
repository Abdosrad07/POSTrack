# POSTrack — Roadmap Backend

Ce document liste les fonctionnalités et tâches du **backend**
uniquement (le frontend React/Vite et les tâches Base de Données sont
hors périmètre de ce dépôt). Il reprend la roadmap projet v3.3-R7
(14 jours) du point de vue de ce qui a été livré.

Légende : ✅ livré et testé · ⚠️ livré partiellement (limite documentée) · ⏳ à faire

---

## 1. État global (version finale, durcie et optimisée)

| Domaine | Statut | Priorité initiale |
|---|---|---|
| Authentification JWT + rôle + révocation + rotation refresh token + anti-brute-force | ✅ | P0 |
| PartnerContext (sélection, contrôle d'accès 3 niveaux) | ✅ | P0 |
| POS : création, consultation, mise à jour, cycle Nouveau/Reconduit | ✅ | P0 |
| Reconduction (transition irréversible, historisation, historique exposé via `GET .../pos/{id}/reconductions`) | ✅ | P0 |
| Primes : éligibilité, calcul par période, validation, rejet après reconduction | ✅ | P0 |
| DSMCommission | ✅ | P0 |
| Import Excel — 10 gabarits, validation NaN-safe | ✅ | P0 |
| Import Excel : application transactionnelle finale des lignes | ✅ | P0 |
| Requêtes multi-entités | ✅ | P1 |
| BTS : consultation, relevés, historique, seuil de saturation, unicité de code | ✅ | P1 |
| Clients et SIM (consultation + opérations locales + tests dédiés) | ✅ | P1 |
| Mouvements de stock SIM complets | ✅ | P1 |
| POSPerformance (calcul optimisé + exposition API) | ✅ | P1 |
| Analytics / Dashboard Partenaire (requêtes SQL optimisées, sans N+1) | ✅ | P1 |
| Alertes d'expiration POS sur le Dashboard | ✅ | P1 |
| Pagination normalisée sur toutes les listes | ✅ | P1 |
| Export téléchargeable du rapport d'erreurs d'import | ✅ | P1 |
| Gestion des utilisateurs (liste, mise à jour) par l'ADMIN | ✅ | P1 |
| Audit des workflows sensibles | ✅ | P1 |
| Index composites et contraintes d'unicité en base | ✅ | — (renforcement) |
| Gestionnaire d'exceptions global + logging structuré (X-Request-ID) | ✅ | — (renforcement) |
| CORS configurable, verrouillage anti-brute-force | ✅ | — (renforcement) |
| Tests automatisés (pytest, couverture ≥ 70 %) | ✅ (55 tests, 91 %) | P0 (recette Jour 13) |
| Migrations Alembic versionnées | ✅ (3 révisions, testées upgrade/downgrade) | — |
| Déploiement / conteneurisation (multi-étapes, non-root, healthcheck) | ✅ (rédigé et optimisé ; `docker compose up` non exécuté faute de démon Docker dans l'environnement de rédaction) | P0 (Jour 14) |

**Toutes les tâches P0/P1 identifiées lors des trois revues
successives (complétude, conformité, renforcement/optimisation) sont
désormais réalisées et testées.**

---

## 2. Passe de renforcement et d'optimisation (dernière itération)

Après la conformité fonctionnelle, une passe dédiée à la performance,
la sécurité et la robustesse a été menée. Elle a mis au jour et
corrigé **5 bugs réels**, en plus des optimisations prévues :

| # | Type | Constat | Correction |
|---|---|---|---|
| 1 | Performance | `bts_saturees` du Dashboard : 1 requête SQL par BTS (N+1) | Sous-requête corrélée, 1 seule requête quel que soit le nombre de BTS |
| 2 | Performance | `calculate_pos_performance` : 1 `db.refresh()` par POS (N+1 caché) | Agrégations `GROUP BY` + écritures en masse (`bulk_insert_mappings`) |
| 3 | Intégrité | `POS.code_pos` / `BTS.code_bts` uniques seulement côté application (race condition possible) | `UniqueConstraint` ajoutée en base pour les deux |
| 4 | Intégrité | Aucune vérification de doublon sur la création BTS (route directe au CRUD) | Service `bts_service.create_bts` dédié |
| 5 | Sécurité | Le refresh token n'était jamais vérifié contre la révocation (restait valide 7 jours après logout) | Vérification ajoutée + **rotation** du refresh token à chaque usage |
| 6 | Données | Cellule Excel vide relue comme `NaN` par pandas → validation défaillante (`"nan"` stocké en base comme texte) | Helpers `_is_blank`/`_clean_str`/`_clean_optional` appliqués à tous les gabarits d'import |

Chaque correction est couverte par un test qui échouait avant la
correction et passe après (démarche test-first pour les points 1, 2 et
6, qui ont été détectés *par* l'écriture des tests eux-mêmes).

Optimisations complémentaires (sans bug associé, pures améliorations) :
- Index composites sur les filtres fréquents (`partner_id` + statut/type)
- Compression GZip des réponses
- CORS configurable au lieu d'un wildcard figé
- Verrouillage anti-brute-force sur le login
- Gestionnaire d'exceptions global (pas de fuite de trace interne)
- Logging structuré avec identifiant de requête
- Dockerfile multi-étapes, utilisateur non-root, `HEALTHCHECK`

Voir `README.md`, section 10, pour le détail complet.

---

## 3. Détail par jour (rappel de la roadmap 14 jours, volet Backend)

- **Jour 1** — Structure FastAPI, connexion SQLAlchemy, mécanisme de
  résolution du contexte Partenaire. ✅
- **Jour 2** — Modèles SQLAlchemy alignés sur le MCD/MLD,
  dépendances `get_partner_context` / contrôle d'accès. ✅
- **Jour 3** — Authentification JWT, résolution du rôle, permissions
  par périmètre, révocation et rotation de jeton, anti-brute-force. ✅
- **Jour 4** — Endpoints de sélection et résolution du contexte
  Partenaire ; gestion Partenaire/DSM/Utilisateurs (écrans
  d'administration). ✅
- **Jour 5** — Données BTS (code, opérateur, technologie, capacité,
  GPS, zone), unicité de code, relevés périodiques. ✅
- **Jours 6-7** — Tampon : consolidation des jours 1 à 5. ✅
- **Jour 8** — Création/consultation POS dans le Partenaire courant,
  `type_pos = NOUVEAU` automatique, contrôle des rattachements,
  unicité de `code_pos` en base. ✅
- **Jour 9** — Reconduction (bascule `RECONDUIT`, historisation, historique
  exposé via `GET .../pos/{id}/reconductions`) et Primes par période
  (`PrimePeriod`, `DSMCommission`). ✅
- **Jour 10** — Clients rattachés au POS, mouvements de stock SIM
  complets, suite de tests dédiée. ✅
- **Jour 11** — Requêtes multi-entités et flux `ImportBatch` complet :
  validation NaN-safe **et** application transactionnelle, sur les
  **10 gabarits** exigés par le cahier des charges. ✅
- **Jour 12** — Dashboard Partenaire optimisé (sans N+1), Analytics
  consolidées, alertes d'expiration POS, audit. ✅
- **Jour 13** — Tests, stabilisation, recette du parcours complet.
  ✅ (suite pytest : 55 tests, 91 % de couverture, scénario critique
  automatisé, non-régression performance)
- **Jour 14** — Déploiement, jeu de données de démonstration,
  présentation. ✅ (seed + guide de lancement + Dockerfile multi-étapes
  optimisé + docker-compose)

---

## 4. Point restant (honnêteté sur les limites de vérification)

1. **Vérification `docker compose up --build` en conditions réelles**
   — le `Dockerfile` (multi-étapes, non-root, healthcheck) et le
   `docker-compose.yml` ont été rédigés et optimisés avec soin, et
   leur syntaxe validée, mais l'environnement de rédaction ne dispose
   pas d'un démon Docker : le premier lancement réel doit être vérifié
   par l'équipe avant tout déploiement de démonstration.

Aucune autre tâche P0/P1 n'est restée ouverte à ce stade.

---

## 5. Perspectives post-sprint (rappel, hors MVP)

Paiement financier réel des primes, intégration à un système
opérateur BTS, activation SIM en temps réel, KYC documentaire,
notifications externes, cartographie avancée (polygones), 2FA/OAuth
externe, réplication MySQL multi-agences.

Pistes de renforcement supplémentaires, envisageables mais non
retenues pour ce sprint (diminishing returns pour un projet
étudiant) : stockage partagé (Redis) pour le verrouillage
anti-brute-force si l'API est un jour déployée en plusieurs
instances ; limitation de débit (rate limiting) générale au-delà du
seul login ; rotation automatique de `SECRET_KEY`.

---

## 6. Points d'architecture à respecter en poursuivant le développement

- Ne jamais faire décider un module `crud/` d'une règle métier —
  cela reste le rôle exclusif de `services/`.
- Toute nouvelle route de ressource métier doit dépendre de
  `get_partner_context` (jamais uniquement d'un filtre ajouté côté
  frontend).
- Toute opération sensible (création, transition d'état, validation,
  import) doit appeler `audit_service.log_action`.
- Toute nouvelle route de liste doit utiliser `CRUDBase.list_paginated`
  (ou son équivalent dans un service) et le schéma `Page[T]`.
- Toute agrégation portant sur un volume qui croît avec les données du
  Partenaire (dashboard, exports, calculs) doit être écrite en
  requêtes SQL groupées — jamais une boucle Python émettant une
  requête par ligne. Ajouter un test dans `test_performance.py` si le
  risque de N+1 est réel.
- Toute valeur issue d'un fichier Excel importé doit passer par
  `_is_blank`/`_clean_str`/`_clean_optional` avant validation ou
  écriture — ne jamais tester `str(row.get(champ, ""))` directement
  (une cellule vide devient `NaN`, pas une chaîne vide).
- Toute modification des modèles SQLAlchemy doit être suivie d'une
  nouvelle migration Alembic (`alembic revision --autogenerate -m
  "..."`), jamais d'une modification manuelle du schéma en base.
- Tout nouveau type d'import Excel doit ajouter une entrée dans
  `REQUIRED_COLUMNS`, une branche `_validate_row()` et une branche
  `_apply_valid_row()` dans `import_validation_service.py`.
- Les anciennes routes génériques non préfixées par
  `/api/partners/{id}/...` ne doivent pas être réintroduites.
- Toute nouvelle règle métier significative doit être accompagnée
  d'au moins un test pytest dans `tests/`, pour préserver la
  couverture actuelle (91 %).
