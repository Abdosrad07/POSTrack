# POSTrack — Wireframes & Maquettes (Design System v2)

> Maquettes basse-fidélité des pages principales, avec leurs états et déclinaisons responsive.
> Légende : `[P]` primaire · `[S]` secondaire · `[G]` ghost · `▓` squelette · `●` pill de statut.

Breakpoints : mobile < 640 px · tablette 640–1024 px · desktop ≥ 1024 px (contenu max ~1400 px).

---

## 1. Layout global (toutes pages)

```
┌──────────────────────────────────────────────────────────────┐
│ Header h-16 : logo POSTrack · recherche globale · rôle ● · ⚙ │
├──────────────────────────────────────────────────────────────┤
│ PartnerSelectorBar : « Contexte partenaire : ORANGE-CI ▾ »   │
├───────────┬──────────────────────────────────────────────────┤
│ Sidebar   │  <main> p-4 / p-6 (contenu de page)              │
│ w-64      │                                                  │
│ filtrée   │                                                  │
│ par rôle  │                                                  │
└───────────┴──────────────────────────────────────────────────┘
```
- Mobile : sidebar en drawer (`translate-x`) + overlay `slate-900/30` ; PartnerSelectorBar passe au-dessus du contenu.
- Accent de niveau : Partenaire = `brand`, DSM = `violet`, POS = `emerald` (bandeau d'en-tête sidebar uniquement).

---

## 2. Dashboard (accueil partenaire)

### Desktop ≥ 1024 px — état succès

```
┌ Fil d'Ariane : Espace partenaire ────────────────────────────┐
│ Dashboard                                    [S Exporter ▾]  │
│ Vue d'ensemble du partenaire — ORANGE-CI                     │
├──────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│ │ POS     │ │ SIM     │ │ Requêtes│ │ Primes  │   KPI x4    │
│ │ total   │ │ stock   │ │ ouvertes│ │ période │   + trend ↗ │
│ │ 128     │ │ 512     │ │  3 ●    │ │ 250k F  │             │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘             │
│ ┌ KPI secondaires : reconduits ● · saturées ● · linkés ● ───┐│
│ ├───────────────────────────┬────────────────────────────────┤|
│ │ Répartition POS (donut)   │ Tendance ventes (aire 6 mois)  │
│ ├───────────────────────────┴────────────────────────────────┤|
│ │ Derniers POS enregistrés                       12 entrée(s) │
│ │ Code   │ Nom      │ Partenaire │ Type  │ Statut │ Linkage  │
│ │ POS-04 │ Boutique │ ORANGE-CI  │ Kiosk │ ● Nouv │ ● Linké  │
│ │ …      │ (ligne hover slate-50, code en mono brand-600)     │
│ └────────────────────────────────────────────────────────────┘
```

### Mobile < 640 px
- KPI en grille 2 colonnes (`grid-cols-2`), valeurs `text-2xl`.
- Graphiques empilés, hauteur fixe 220 px.
- Table « Derniers POS » → 4 colonnes (Code, Nom, Statut, Linkage) avec scroll horizontal.

### États
- **Loading** : 4 KPI squelettes (`▓` label + `▓` valeur) + aires graphiques squelettées + 6 lignes de table `▓`.
- **Erreur API** : `ErrorState` (icône triangle rouge, titre, bouton `[S Réessayer]`) dans la card concernée — le reste de la page reste affiché.
- **Vide** (nouveau partenaire) : `EmptyState` « Aucun POS enregistré » + `[P + Créer un POS]`.

<!-- SUITE-WF2 -->

---

## 3. Gestion des Partenaires (table à N colonnes → digestible)

### Desktop — état succès

```
┌ Partenaires ──────────────────────────────── [S Exporter] [P + Nouveau] ┐
┌────────────────────────────────────────────────────────────────────────┐
│ 🔍 Rechercher un partenaire…   [Statut : tous ▾]      12 résultats     │
│ (Statut : actif) ×        Réinitialiser          ← chips de filtres    │
├────────────────────────────────────────────────────────────────────────┤
│ Code↕   │ Nom↕        │ Resp.      │ POS↕ │ Statut   │ Contrat │ ⋯   │
│ PART-01 │ ORANGE-CI   │ A. Diallo  │  128 │ ● actif  │ 01/2024 │ ⋯   │
│ PART-02 │ MTN-NORD    │ B. Traoré  │   42 │ ● inactif│ 06/2023 │ ⋯   │
│  (colonnes Contacts/Commercial/MasterSIM/Dates → masquées < xl)        │
├────────────────────────────────────────────────────────────────────────┤
│ Affichage 1–20 sur 45                        ‹  1  [2]  3  …  ›        │
└────────────────────────────────────────────────────────────────────────┘
```

**Règles appliquées**
- 15 colonnes brutes → 7 visibles + 8 en `hidden xl:table-cell` (détail dans la fiche partenaire).
- Tri par clic sur `Code`, `Nom`, `POS` ; `aria-sort` sur l'en-tête actif.
- Actions : ligne cliquable → fiche détail ; menu `⋯` = Modifier / Désactiver.
- Mobile : le tableau défile horizontalement (3 premières colonnes sticky non requis) OU vue cartes si < 640 px :

```
┌ PART-01 ──────────── ● actif ┐   ┌ PART-02 ─────────── ● inactif ┐
│ ORANGE-CI                    │   │ MTN-NORD                      │
│ 128 POS · contrat 01/2024    │   │ 42 POS · contrat 06/2023      │
│ [S Voir] [S Modifier]        │   │ [S Voir] [S Modifier]         │
└──────────────────────────────┘   └───────────────────────────────┘
```

### États
- Loading → 6 lignes squelettes ; vide → EmptyState « Aucun partenaire » + CTA ; erreur → ErrorState + Réessayer.

---

## 4. Liste des POS (géographie + liste)

### Desktop

```
┌ Points de vente ─────────────────────── [S Exporter] [P + Nouveau POS] ┐
│ 🔍 Rechercher…  [Type : tous ▾] [Statut : tous ▾] [Zone : tous ▾]  128 │
├────────────────────────────────────────────────────────────────────────┤
│ Affichage : [ Liste | Carte ]   ← SegmentedControl                      │
│ ┌──────────────────────────────────────┬────────────────────────────┐ │
│ │ Carte Leaflet (h-[420px])            │ Détail POS sélectionné      │ │
│ │  ● créé  ● reconduit  ● lié          │ code mono · statut ●        │ │
│ │  (marqueurs cliquables, cercle zone) │ lien BTS · actions [S][P]   │ │
│ └──────────────────────────────────────┴────────────────────────────┘ │
│ Vue Liste : DataTable standard (Code, Nom, Zone, BTS, SIM, Statut ●)   │
└────────────────────────────────────────────────────────────────────────┘
```

- La sélection carte ↔ liste est synchronisée (ligne surlignée `row-selected`).
- Mobile : SegmentedControl plein largeur ; carte h-300 px ; tableau → cartes empilées.

---

## 5. Formulaire complexe (création POS)

```
┌ Nouveau point de vente ──────────────────────────── Étape 1 sur 3 ────┐
│  (1)●──────(2)○──────────(3)○      ← Stepper                          │
│  Identité  Localisation   Confirmation   (labels sous les pastilles)  │
├───────────────────────────────────────────────────────────────────────┤
│ 1. Identité                                                           │
│  Code POS*                    Type de POS*                            │
│  ┌ POS-______ ┐               ┌ Kiosk ▾          ┐                    │
│  ↳ help « Format POS-001 »    ↳                                   │
│  Nom commercial*                                                      │
│  ┌ ____________┐  (erreur : ✗ Le nom est obligatoire, role=alert)     │
├───────────────────────────────────────────────────────────────────────┤
│                                    [G Annuler]  [S Suivant →]         │
└───────────────────────────────────────────────────────────────────────┘
```

- Étape 2 (Localisation) : BTS ▾ + Micro-zone ▾ + champ GPS + bouton [S Localiser sur la carte].
- Étape 3 (Confirmation) : récapitulatif lecture seule + [P Créer le POS] avec `.btn-loading` pendant l'envoi.
- Validation : au blur puis au submit ; champs valides discrets, erreurs explicites sous le champ.
- Mobile : Stepper affiché en version compacte (pastilles + n° d'étape dans le titre).

---

## 6. Authentification (conservée, assainie)

```
│            (mesh brand subtil en fond)                                │
│        ┌────────────── glass-strong, rounded-2xl ─────────────┐       │
│        │        bandeau dégradé brand (h-24) + logo           │       │
│        │  [ Connexion ]                                       │       │
│        │  Email    ┌ input ┐                                  │       │
│        │  Mot de passe ┌ input ┐  ← erreurs sous champs       │       │
│        │  [P Se connecter w-full .btn-loading si submit]      │       │
│        └───────────────────────────────────────────────────────┘      │
```

## 7. Matrice des états (toutes pages de données)

| État | Rendu |
|---|---|
| Loading | Squelettes dans les cards (jamais page blanche) |
| Vide | `EmptyState` (icône, message FR, action primaire contextuelle) |
| Erreur | `ErrorState` (rouge doux, bouton Réessayer) — par card, pas full-page |
| Succès | Données + toasts/alertes de confirmation (vert, auto-dismiss) |
| Partiel | Badges de compte sur les filtres (`Statut : actif (42)`) |

