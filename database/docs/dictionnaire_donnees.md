# POSTrack — Dictionnaire de données

Livrable Jour 3 — équipe Base de Données. Généré à partir de `schema.sql` (version alignée MLD v3.1).

---

## 1. users

| Colonne | Type | Nullable | Description |
|---|---|---|---|
| id | INTEGER | non | identifiant technique |
| email | VARCHAR(100) | non, UNIQUE | identifiant de connexion |
| password_hash | VARCHAR(255) | non | mot de passe haché (bcrypt côté Backend) |
| nom_complet | VARCHAR(100) | non | nom affiché |
| role | VARCHAR(20) | non | ADMIN / MANAGER / CHEF_OPERATIONNEL / OPERATIONNEL — contrôle les permissions |
| actif | INTEGER (0/1) | non | permet de désactiver un compte sans le supprimer |
| created_at / updated_at | DATETIME | non | horodatage automatique |

## 2. partenaires

| Colonne | Type | Nullable | Description |
|---|---|---|---|
| id | INTEGER | non | identifiant technique |
| code_partenaire | VARCHAR(50) | non, UNIQUE | identifiant métier (ex: PART-MC) |
| nom | VARCHAR(100) | non | nom du partenaire (ex: Master Color) |
| type_partenaire | VARCHAR(30) | oui | DISTRIBUTEUR / MASTER_DEALER / REVENDEUR |
| region / ville / adresse | VARCHAR | oui | localisation |
| contact_principal / telephone / email | VARCHAR | oui | contact du partenaire |
| date_signature_contrat / date_fin_contrat | DATE | oui | durée du contrat de distribution |
| statut | VARCHAR(20) | non | ACTIF / SUSPENDU / RESILIE |
| est_provisoire | INTEGER (0/1) | non | 0 = partenaire réel confirmé (Master Color, Glothelo) ; 1 = créé automatiquement par un import, identité à confirmer |
| created_by | INTEGER (FK users) | oui | utilisateur ayant créé la fiche |
| created_at / updated_at | DATETIME | non | horodatage automatique |

## 3. dsm

| Colonne | Type | Nullable | Description |
|---|---|---|---|
| id | INTEGER | non | identifiant technique |
| user_id | INTEGER (FK users) | oui | compte de connexion associé, si le DSM en a un |
| matricule | VARCHAR(50) | non, UNIQUE | identifiant métier (ex: DSM-DLA-01) |
| nom_complet | VARCHAR(100) | non | nom affiché |
| zone_couverture | VARCHAR(100) | oui | zone géographique supervisée |
| telephone / email | VARCHAR | oui | contact |
| date_affectation | DATE | oui | date de prise de poste sur la zone |
| statut | VARCHAR(20) | non | ACTIF / INACTIF |
| est_provisoire | INTEGER (0/1) | non | 1 = DSM connu seulement par son numéro de téléphone (import Excel), en attente d'identification |
| created_at / updated_at | DATETIME | non | horodatage automatique |

## 4. pos (table centrale)

| Colonne | Type | Nullable | Description |
|---|---|---|---|
| id | INTEGER | non | identifiant technique |
| code_pos | VARCHAR(50) | non, UNIQUE | code généré par l'appli, jamais par le client, préfixé par partenaire (POS-MC-…, POS-GL-…) |
| nom | VARCHAR(150) | non | nom affiché |
| adresse / ville / region | VARCHAR | oui | localisation générale |
| quartier / lieu_dit | VARCHAR | oui | viennent des fichiers Excel des partenaires |
| latitude / longitude | REAL | oui | coordonnées GPS (pas encore fournies par les partenaires) |
| categorie_pos | VARCHAR(30) | oui | KIOSQUE / BOUTIQUE / … |
| type_pos | VARCHAR(20) | non | NOUVEAU ou RECONDUIT — conditionne la prime |
| statut | VARCHAR(20) | non | ACTIF / SUSPENDU / RENOUVELLEMENT / CLOTURE |
| numero_pos | VARCHAR(20) | oui, UNIQUE | vient du fichier Excel, jamais généré |
| contact_principal / telephone / email_contact | VARCHAR | oui | contact du POS |
| contact_secondaire | VARCHAR(20) | oui | vient du fichier Excel |
| montant_initial | NUMERIC(10,2) | oui | montant versé à la création — jamais une prime |
| notes | TEXT | oui | observations libres |
| partenaire_id / dsm_id | INTEGER (FK) | non | toujours obligatoires (contrainte du MLD) |
| gestionnaire_id | INTEGER (FK users) | oui | utilisateur qui gère le POS au quotidien |
| date_creation | DATE | non | date de création du POS |
| date_expiration | DATE | oui | mise à jour automatiquement à chaque reconduction |
| date_derniere_reconduction | DATE | oui | dernière date de renouvellement |
| created_by / updated_by | INTEGER (FK users) | oui | traçabilité |
| created_at / updated_at | DATETIME | non | horodatage automatique |

## 5. reconductions

| Colonne | Type | Nullable | Description |
|---|---|---|---|
| id | INTEGER | non | identifiant technique |
| pos_id | INTEGER (FK pos) | non | POS concerné |
| date_reconduction | DATE | non | date de l'événement |
| ancienne_date_expiration | DATE | non | expiration avant reconduction |
| nouvelle_date_expiration | DATE | non | expiration après reconduction |
| motif | TEXT | oui | justification |
| valide_par | INTEGER (FK users) | oui | utilisateur ayant validé |
| created_at | DATETIME | non | horodatage automatique |

## 6. primes

| Colonne | Type | Nullable | Description |
|---|---|---|---|
| id | INTEGER | non | identifiant technique |
| pos_id | INTEGER (FK pos) | non, UNIQUE | un seul enregistrement de prime par POS, sur toute sa durée de vie |
| dsm_id | INTEGER (FK dsm) | oui | DSM concerné |
| partenaire_id | INTEGER (FK partenaires) | oui | partenaire concerné |
| montant | DECIMAL(10,2) | non | montant de la prime |
| statut | VARCHAR(20) | non | EN_ATTENTE / VALIDEE / PAYEE / REJETEE |
| date_attribution | DATE | non | date de constatation de l'éligibilité |
| commentaire | TEXT | oui | note libre |
| created_at / updated_at | DATETIME | non | horodatage automatique |

## 7. clients

| Colonne | Type | Nullable | Description |
|---|---|---|---|
| id | INTEGER | non | identifiant technique |
| code_client | VARCHAR(50) | non, UNIQUE | code métier du client |
| nom_complet | VARCHAR(100) | non | identité du client |
| telephone | VARCHAR(20) | oui | contact |
| numero_piece_identite | VARCHAR(50) | oui | numéro de pièce d'identité |
| type_piece | VARCHAR(20) | oui | CNI / PASSEPORT / CARTE_SEJOUR |
| pos_id | INTEGER (FK pos) | non | POS d'enregistrement |
| date_enregistrement | DATE | non | date d'inscription |
| statut | VARCHAR(20) | non | ACTIF / INACTIF |
| created_by | INTEGER (FK users) | oui | utilisateur ayant enregistré le client |
| created_at / updated_at | DATETIME | non | horodatage automatique |

## 8. bts

| Colonne | Type | Nullable | Description |
|---|---|---|---|
| id | INTEGER | non | identifiant technique |
| code_bts | VARCHAR(50) | non, UNIQUE | identifiant métier |
| nom | VARCHAR(100) | oui | nom affiché |
| partenaire_id | INTEGER (FK partenaires) | non | partenaire exploitant |
| operateur | VARCHAR(30) | non | MTN / ORANGE / CAMTEL / NEXTTEL |
| technologie | VARCHAR(20) | oui | ex: 4G, 5G |
| region / ville | VARCHAR | oui | localisation |
| latitude / longitude | REAL | oui | coordonnées GPS |
| capacite_max | INTEGER | non | capacité maximale de la BTS |
| dernier_taux_saturation / dernier_rendement | REAL | oui | cache mis à jour automatiquement à chaque nouveau relevé (trigger) |
| date_dernier_releve | DATETIME | oui | horodatage du dernier relevé enregistré |
| date_mise_service | DATE | oui | date de mise en service |
| statut | VARCHAR(20) | non | ACTIF / MAINTENANCE / HORS_SERVICE |
| created_at / updated_at | DATETIME | non | horodatage automatique |

## 9. bts_releves

| Colonne | Type | Nullable | Description |
|---|---|---|---|
| id | INTEGER | non | identifiant technique |
| bts_id | INTEGER (FK bts) | non | BTS concernée |
| date_releve | DATETIME | non | date et heure du relevé |
| charge_mesuree | INTEGER | non | charge mesurée au moment du relevé |
| taux_saturation | REAL | oui | charge_mesuree / capacite_max × 100 (%) |
| rendement | REAL | oui | indicateur de performance (%) |
| remarque | TEXT | oui | observation libre |
| created_by | INTEGER (FK users) | oui | auteur du relevé |
| created_at | DATETIME | non | horodatage automatique |

## 10. sims

| Colonne | Type | Nullable | Description |
|---|---|---|---|
| id | INTEGER | non | identifiant technique |
| iccid | VARCHAR(22) | non, UNIQUE | identifiant physique de la carte SIM |
| numero_msisdn | VARCHAR(20) | oui | numéro de téléphone associé |
| operateur | VARCHAR(30) | non | MTN / ORANGE / CAMTEL / NEXTTEL |
| statut | VARCHAR(20) | non | EN_STOCK / VENDUE / ACTIVEE / DEFECTUEUSE / RETOURNEE |
| pos_id | INTEGER (FK pos) | non | POS détenteur du stock |
| client_id | INTEGER (FK clients) | oui | client acquéreur, renseigné dès la vente |
| date_reception_stock / date_vente / date_activation | DATE | oui | dates du cycle de vie de la SIM |
| created_at / updated_at | DATETIME | non | horodatage automatique |

## 11. requetes

| Colonne | Type | Nullable | Description |
|---|---|---|---|
| id | INTEGER | non | identifiant technique |
| code_requete | VARCHAR(50) | non, UNIQUE | code métier |
| type_requete | VARCHAR(30) | non | APPROVISIONNEMENT_SIM / MAINTENANCE_BTS / RECLAMATION_CLIENT / SUPPORT_POS / AUTRE |
| objet | VARCHAR(255) | non | titre court |
| description | TEXT | oui | détail de la demande |
| statut | VARCHAR(20) | non | OUVERTE / EN_COURS / RESOLUE / FERMEE |
| priorite | VARCHAR(20) | non | BASSE / NORMALE / HAUTE / URGENTE |
| partenaire_id / pos_id / bts_id / client_id | INTEGER (FK, nullable) | oui | entité concernée selon le type — normalement une seule des quatre est renseignée |
| demandeur_id | INTEGER (FK users) | oui | utilisateur à l'origine de la requête |
| assigne_a | INTEGER (FK users) | oui | utilisateur en charge du traitement |
| date_creation | DATETIME | non | date de création |
| date_resolution | DATETIME | oui | date de clôture |
| updated_at | DATETIME | non | horodatage automatique |

## 12. audit_logs

| Colonne | Type | Nullable | Description |
|---|---|---|---|
| id | INTEGER | non | identifiant technique |
| user_id | INTEGER (FK users) | oui | utilisateur ayant réalisé l'action |
| action | VARCHAR(50) | non | ex: CREATE / UPDATE / DELETE |
| entity_type | VARCHAR(50) | non | ex: POS / PARTENAIRE |
| entity_id | INTEGER | oui | identifiant de l'entité concernée (pas de FK stricte, entity_type variable) |
| ancien_statut / nouveau_statut | VARCHAR(50) | oui | valeurs avant/après, si pertinent |
| details | TEXT | oui | description libre de l'action |
| created_at | DATETIME | non | horodatage automatique |

---

## Table de correspondance SQLite ↔ SQLAlchemy

| Type SQLite | Type SQLAlchemy | Remarque |
|---|---|---|
| INTEGER PRIMARY KEY AUTOINCREMENT | Integer, primary_key=True | |
| VARCHAR(n) | String(n) | |
| TEXT | Text | |
| DATE / DATETIME | Date / DateTime | |
| NUMERIC(10,2) / DECIMAL(10,2) | Numeric(10,2) | |
| REAL | Float | |
| INTEGER CHECK (x IN (0,1)) | Boolean | SQLAlchemy convertit tout seul 0/1 ↔ False/True |
| VARCHAR CHECK (x IN (...)) | Enum(...) ou String + CheckConstraint | au choix du Backend |

## Contraintes d'unicité (à ne pas oublier)

- `users.email`
- `dsm.matricule`
- `partenaires.code_partenaire`
- `pos.code_pos`
- `pos.numero_pos`
- `clients.code_client`
- `bts.code_bts`
- `sims.iccid`
- `requetes.code_requete`
- `primes.pos_id` (une seule prime par POS)
