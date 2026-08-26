# Données source nécessaires pour les Recettes de Vente

## Analyse des modèles existants

### Recettes actuellement disponibles
- **Primes** : `Prime.montant` (table `primes`) - représente les récompenses versées aux POS
- **Commissions DSM** : `DSMCommission.amount` (table `dsm_commissions`) - représente les parts de primes pour les DSM
- **Dashboard** : `montant_primes_periode` - somme des primes validées/payées

### Ce qui manque : Recettes de Vente (Chiffre d'Affaires)

**⚠️ Donnée manquante identifiée**

Il n'existe actuellement pas de modèle de données pour stocker les **recettes de vente** (chiffre d'affaires généré par les ventes de SIM).

### Distinction importante

| Indicateur | Description | Source actuelle |
|------------|-------------|-----------------|
| **Recettes** | Chiffre d'affaires généré par les ventes | ❌ MANQUANT |
| **Sell-out** | Volume de SIM vendues/activées | ✅ SIMMovement (VENTE/ACTIVATION) |
| **Loading** | Volume de SIM consommées par le marché | ✅ SIMMovement (VENTE/ACTIVATION) |
| **Primes** | Récompenses versées aux POS/DSM | ✅ Prime.montant |

### Structure de données nécessaire

Pour implémenter correctement les recettes de vente, il faut :

1. **Niveau Partenaire** :
   - Table ou champ pour stocker les recettes mensuelles par partenaire
   - Structure suggérée : extension de `PartnerSalesTarget` ou nouvelle table `PartnerRevenue`

2. **Niveau DSM** :
   - Table ou champ pour stocker les recettes mensuelles par DSM
   - Structure suggérée : extension de `DSMCommission` ou nouvelle table `DSMRevenue`

### Source de données recommandée

**Source Excel/API à définir :**
- Fichier d'import des ventes avec colonne `montant_vente` ou `recette`
- Ou API de facturation/télécom pour récupérer le chiffre d'affaires réel
- Périodicité : mensuelle (alignée sur les périodes de primes)

### Implémentation temporaire

En attendant la disponibilité des données de recettes réelles :
- Utiliser les primes comme indicateur proxy (mais ce n'est pas exact)
- Afficher clairement "Donnée non disponible" pour les recettes de vente
- Préparer la structure pour accueillir les vraies données quand disponibles

### Champs à ajouter (quand données disponibles)

```sql
-- Extension de PartnerSalesTarget
ALTER TABLE partner_sales_targets ADD COLUMN revenue_target NUMERIC(12,2);
ALTER TABLE partner_sales_targets ADD COLUMN revenue_realisation NUMERIC(12,2);

-- Ou nouvelle table
CREATE TABLE partner_revenue (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(id),
    dsm_id INTEGER REFERENCES dsm(id),
    period_start DATE,
    period_end DATE,
    revenue_amount NUMERIC(12,2),
    source VARCHAR(50), -- 'IMPORT', 'API', 'MANUEL'
    created_at TIMESTAMP DEFAULT NOW()
);
```