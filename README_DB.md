# POSTrack — Base de données (README équipe DB)

Ce document explique comment les équipes **Backend** et **Frontend** utilisent la base de données produite par l'équipe DB 

## 1\. Stack et choix technique

* **En local, pour ce projet (14 jours)** : nous développons avec **SQLite** (choix assumé pour aller vite). Le fichier de base s'appelle `postrack.db`, généré à partir de `schema.sql`.
* Le DDL SQLite reste proche du DDL MySQL cible (types, contraintes `CHECK`, clés étrangères) — la migration future ne devrait pas nécessiter de refonte du modèle, seulement des ajustements de syntaxe.

## 2\. Structure du dossier `database/`

```
database/
├── schema.sql                  # Définition des 12 tables + triggers + index
├── seed.sql                    # Jeu de données de démonstration
├── postrack.db                 # Base SQLite générée (ne pas committer si volumineuse)
├── sql/
│   ├── 04\_vues.sql              # Vues v\_pos\_detail, v\_dsm\_charge
│   └── 05\_bts\_historique.sql    # Vue v\_bts\_historique
├── queries/
│   └── suivi\_dsm\_provisoires.sql   # Requête de suivi hebdo des DSM non confirmés
└── imports/
    └── import\_pos.py            # Script d'import des fichiers Excel partenaires
```

## 3\. Mettre en place la base en local

Depuis le dossier `database/` :

**PowerShell (Windows)** — pas de redirection `<`, on utilise `Get-Content` en pipe :

```powershell
Get-Content schema.sql | sqlite3 postrack.db
Get-Content seed.sql | sqlite3 postrack.db
Get-Content sql\\04\_vues.sql | sqlite3 postrack.db
Get-Content sql\\05\_bts\_historique.sql | sqlite3 postrack.db
```

**bash / macOS / Linux** :

```bash
sqlite3 postrack.db < schema.sql
sqlite3 postrack.db < seed.sql
sqlite3 postrack.db < sql/04\_vues.sql
sqlite3 postrack.db < sql/05\_bts\_historique.sql
```

Pour repartir d'une base propre, supprimez `postrack.db` avant de rejouer les scripts ci-dessus (sinon les `INSERT` du seed échoueront avec `UNIQUE constraint failed`, car les données existent déjà).

## 4\. Modèle de données — vue d'ensemble

12 tables, alignées sur le MLD du cahier des charges v3.1 :

|Table|Rôle|
|-|-|
|`users`|Comptes de connexion (rôles ADMIN, MANAGER, DSM, VIEWER)|
|`partenaires`|Distributeurs possédant des POS et des BTS|
|`dsm`|Superviseurs régionaux/locaux des POS|
|`pos`|Points de vente — entité centrale|
|`reconductions`|Historique des renouvellements de contrat d'un POS|
|`primes`|Suivi des primes (1 seule par POS, uniquement si NOUVEAU)|
|`clients`|Utilisateurs finaux, rattachés à un POS|
|`bts`|Infrastructure réseau exploitée par un partenaire|
|`bts\_releves`|Historique des mesures de charge/saturation/rendement|
|`sims`|Stock individualisé des cartes SIM|
|`requetes`|Suivi des demandes/incidents remontés du terrain|
|`audit\_logs`|Journal de traçabilité|

### Règle métier centrale à connaître (Backend en particulier)

Un POS naît avec `type\_pos = 'NOUVEAU'` et est éligible à une prime unique. Dès qu'une ligne est insérée dans `reconductions`, un **trigger** (`trg\_reconductions\_update\_pos`) bascule automatiquement `pos.type\_pos` à `'RECONDUIT'`, met à jour `date\_derniere\_reconduction` et `date\_expiration`. **Ce basculement est définitif** : un POS reconduit ne redevient jamais `'NOUVEAU'`, et ne peut donc plus recevoir de prime. Backend doit refuser explicitement (erreur de validation) toute tentative de création de prime pour un POS dont `type\_pos != 'NOUVEAU'` — la contrainte `UNIQUE` sur `primes.pos\_id` empêche déjà les doublons, mais pas la création d'une prime sur un POS reconduit : cette règle-là doit être vérifiée côté application.

De même, un relevé inséré dans `bts\_releves` déclenche le trigger `trg\_bts\_releves\_update\_cache`, qui met à jour automatiquement le cache (`dernier\_taux\_saturation`, `dernier\_rendement`, `date\_dernier\_releve`) sur la table `bts`. Backend n'a donc pas besoin de recalculer ce cache manuellement — il suffit d'insérer le relevé.

### Statuts et énumérations (contraintes `CHECK` en base)

* `pos.type\_pos` : `NOUVEAU`, `RECONDUIT`
* `pos.statut` : `ACTIF`, `SUSPENDU`, `RENOUVELLEMENT`, `CLOTURE`
* `primes.statut` : `EN\_ATTENTE`, `VALIDEE`, `PAYEE`, `REJETEE`
* `sims.statut` : `EN\_STOCK`, `VENDUE`, `ACTIVEE`, `DEFECTUEUSE`, `RETOURNEE`
* `requetes.statut` : `OUVERTE`, `EN\_COURS`, `RESOLUE`, `FERMEE`
* `requetes.priorite` : `BASSE`, `NORMALE`, `HAUTE`, `URGENTE`
* `users.role` : `ADMIN`, `MANAGER`, `DSM`, `VIEWER`

Ces valeurs sont appliquées par des contraintes `CHECK` directement dans `schema.sql` — toute tentative d'insertion avec une autre valeur est rejetée par SQLite lui-même.

### Champs "provisoires" — à surveiller côté Backend/Frontend

`partenaires.est\_provisoire` et `dsm.est\_provisoire` (0 ou 1) signalent des enregistrements créés automatiquement lors d'un import Excel, en attendant confirmation par le client. Un DSM provisoire est identifié uniquement par son numéro de téléphone (`matricule` généré du type `DSM-TEMP-<telephone>`), sans nom réel connu. **Ne pas afficher un DSM provisoire comme un DSM confirmé côté Frontend** — utiliser ce flag pour distinguer visuellement les deux cas (badge "à confirmer" par exemple).

## 5\. Vues SQL disponibles

Ces vues existent pour éviter à Backend de réécrire les mêmes jointures à chaque requête.

### `v\_pos\_detail`

POS avec partenaire et DSM déjà résolus (jointure faite) :

```sql
SELECT \* FROM v\_pos\_detail WHERE partenaire\_id = 2;
```

Colonnes : `id, code\_pos, nom, categorie\_pos, type\_pos, statut, quartier, lieu\_dit, montant\_initial, partenaire\_id, partenaire\_nom, dsm\_id, dsm\_nom, dsm\_provisoire`.

### `v\_dsm\_charge`

Nombre de POS supervisés par chaque DSM :

```sql
SELECT \* FROM v\_dsm\_charge ORDER BY nb\_pos DESC;
```

Colonnes : `id, matricule, nom\_complet, nb\_pos`.

### `v\_bts\_historique`

Historique des relevés d'une BTS, triés par date :

```sql
SELECT \* FROM v\_bts\_historique WHERE code\_bts = 'BTS-DLA-02';
```

Colonnes : `code\_bts, nom, date\_releve, taux\_saturation, rendement, charge\_mesuree`. Utile telle quelle pour alimenter les graphiques de tendance côté Frontend (Recharts).

## 6\. Requête de suivi hebdomadaire

`queries/suivi\_dsm\_provisoires.sql` — combien de POS, par partenaire, sont encore rattachés à un DSM non confirmé :

```sql
SELECT pa.nom AS partenaire, COUNT(\*) AS pos\_dsm\_provisoire
FROM pos p
JOIN partenaires pa ON p.partenaire\_id = pa.id
JOIN dsm d ON p.dsm\_id = d.id
WHERE d.est\_provisoire = 1
GROUP BY pa.nom;
```

## 7\. Import des données réelles (fichiers Excel partenaires)

`imports/import\_pos.py` importe les fichiers Excel fournis par les partenaires (Master Color, et bientôt Glothelo). Chaque partenaire doit déjà exister dans `partenaires` (voir `seed.sql`) avant de lancer un import — le script ne crée plus de partenaire à la volée.

```powershell
cd imports
python import\_pos.py --dry-run    # rapport seul, rien en base — à relire avant de valider
python import\_pos.py --commit     # écriture réelle
```

Le script génère un rapport CSV (`rapport\_import\_YYYYMMDD.csv`) listant chaque ligne traitée, son statut (OK / IGNORE si déjà importé / REJETE avec le motif), et le `code\_pos` attribué. Les codes sont générés par partenaire (`POS-MC-...`, `POS-GL-...`) — jamais mélangés entre partenaires.

## 8\. Comptes de test (seed.sql)

|Rôle|Email|Notes|
|-|-|-|
|ADMIN|admin@postrack.cm|Compte de démonstration|
|DSM|dsm.douala@postrack.cm|DSM confirmé (non provisoire)|

Les `password\_hash` du seed sont des valeurs factices (`hash\_admin\_123`, etc.), à remplacer par de vrais hash bcrypt une fois l'authentification JWT branchée côté Backend.

## 9\. Index existants

Déjà en place dans `schema.sql` (pas besoin d'en recréer) : `idx\_pos\_type\_pos`, `idx\_pos\_statut`, `idx\_pos\_partenaire`, `idx\_pos\_dsm`, `idx\_pos\_quartier`, `idx\_primes\_pos`, `idx\_primes\_statut`, `idx\_reconductions\_pos`, `idx\_clients\_pos`, `idx\_bts\_partenaire`, `idx\_bts\_releves\_bts`, `idx\_sims\_pos`, `idx\_sims\_client`, `idx\_requetes\_pos`, `idx\_requetes\_partenaire`, `idx\_requetes\_bts`, `idx\_audit\_logs\_user`.

## 10\. Organisation Git

```
main ← dev ← database (branche officielle équipe DB) ← feature/db-xxx
```

* On ne travaille jamais directement sur `database` ni sur `main`.
* Toute modification passe par une branche `feature/db-<sujet>`, avec Pull Request **vers `database`**.
* La branche `database` n'est jamais supprimée.
* Une fois `database` stable, une PR est ouverte `database → dev`.

## 11\. Contact

Pour toute question sur le schéma, les vues, ou une évolution du modèle de données : **Alma (Lead DB)**.

