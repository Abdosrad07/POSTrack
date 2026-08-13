# POSTrack — Base de données

Documentation de l'équipe **Base de Données** : schéma, seed, vues SQL et imports.

> Pour alimenter l'API et le frontend, utilisez le pipeline backend décrit dans [../guides/DATASETUP.md](../guides/DATASETUP.md).

## Structure du dossier `database/`

```
database/
├── schema.sql              # 12 tables + triggers + index
├── seed.sql                # Jeu de données de démonstration
├── docs/
│   └── dictionnaire_donnees.md
├── sql/
│   ├── 04_vues.sql         # v_pos_detail, v_dsm_charge
│   └── 05_bts_historique.sql
├── queries/
│   └── suivi_dsm_provisoires.sql
└── imports/
    ├── import_pos.py       # Script legacy (voir backend/scripts/import_pos.py)
    └── *.xlsx              # Fichiers Excel partenaires
```

## Pipeline SQL pur (équipe DB)

**PowerShell :**

```powershell
cd database
Get-Content schema.sql | sqlite3 postrack.db
Get-Content seed.sql | sqlite3 postrack.db
Get-Content sql\04_vues.sql | sqlite3 postrack.db
Get-Content sql\05_bts_historique.sql | sqlite3 postrack.db
```

Produit `database/postrack.db` — **distinct** de `backend/postrack.db`.

## Modèle de données (12 tables)

| Table | Rôle |
|---|---|
| `users` | Comptes (ADMIN, MANAGER, DSM, VIEWER) |
| `partenaires` | Distributeurs |
| `dsm` | Superviseurs régionaux |
| `pos` | Points de vente (entité centrale) |
| `reconductions` | Historique renouvellements POS |
| `primes` | Primes (1 par POS, si NOUVEAU) |
| `clients` | Clients finaux |
| `bts` | Stations de base |
| `bts_releves` | Mesures charge/saturation |
| `sims` | Stock cartes SIM |
| `requetes` | Demandes terrain |
| `audit_logs` | Journal de traçabilité |

## Règle métier centrale

Un POS naît `NOUVEAU`. Une reconduction le bascule **définitivement** en `RECONDUIT` (trigger `trg_reconductions_update_pos`). Un POS reconduit ne peut plus recevoir de prime.

## Vues SQL

- `v_pos_detail` — POS + partenaire + DSM jointés
- `v_dsm_charge` — Nombre de POS par DSM
- `v_bts_historique` — Relevés BTS triés par date

## Import Excel

Le script recommandé pour l'API est `backend/scripts/import_pos.py`.  
Le script legacy `database/imports/import_pos.py` cible `database/postrack.db`.

## Contact

Lead DB : **Alma**
