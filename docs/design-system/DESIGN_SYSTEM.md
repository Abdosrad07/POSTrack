# POSTrack Design System — v2 « Horizon »

> Référence unique pour toute l'interface POSTrack (React 19 + Tailwind CSS v4).
> Jetons implémentés dans `frontend/src/index.css` (`@theme` + couche composants).
> Style de référence : Stripe / Linear / Vercel — sobre, dense, intemporel.

---

## 1. Principes directeurs

1. **La donnée d'abord** — lisibilité des chiffres et des statuts avant toute décoration.
2. **Une action primaire par vue** — tout le reste est secondaire (contour) ou tertiaire (fantôme).
3. **Sobriété premium** — surfaces plates, bordures fines, ombres discrètes ; pas de dégradés sur les contrôles.
4. **Intemporalité** — pas d'effets de mode (glassmorphism limité au login, pas de néomorphisme).
5. **Accessibilité AA** — contrastes ≥ 4.5:1 pour le texte, focus visible partout, `prefers-reduced-motion` respecté.

---

## 2. Couleurs

### 2.1 Marque — Indigo « Horizon » (jeton `brand`)

| Token | Hex | Usage |
|---|---|---|
| `brand-50` | `#eef2ff` | Fonds de sélection, hover de lignes actives |
| `brand-100` | `#e0e7ff` | Fonds d'icônes, anneaux de focus doux |
| `brand-200` | `#c7d2fe` | Bordures d'accents, chips |
| `brand-300` | `#a5b4fc` | Décorations, illustrations |
| `brand-400` | `#818cf8` | Bordures de focus des champs |
| `brand-500` | `#6366f1` | Accents KPI, icônes, focus ring |
| `brand-600` | `#4f46e5` | **Primaire** : boutons, liens actifs (6.3:1 ✓ AA) |
| `brand-700` | `#4338ca` | Hover primaire, liens |
| `brand-800` | `#3730a3` | Active primaire |
| `brand-900` | `#312e81` | Texte sur fonds brand-50/100 |
| `brand-950` | `#1e1b4b` | En-têtes sombres rares |

**Règle** : le texte sur fond blanc utilise `brand-600` minimum (jamais 400/500).

### 2.2 Neutres — Slate (Tailwind par défaut)

| Usage | Token |
|---|---|
| Titres / valeurs | `slate-900` `#0f172a` |
| Texte courant | `slate-700` `#334155` |
| Texte secondaire | `slate-500` `#64748b` |
| Placeholders / désactivé | `slate-400` `#94a3b8` |
| Bordures par défaut | `slate-200` `#e2e8f0` |
| Bordures fortes / hover | `slate-300` `#cbd5e1` |
| Fonds d'en-têtes de table | `slate-50` `#f8fafc` |
| Fond d'application | `slate-50` + mesh discret |

### 2.3 Sémantiques (badges, alertes, statuts)

| Sens | Fond | Texte | Bordure |
|---|---|---|---|
| Succès / actif | `#ecfdf5` | `#065f46` | `#a7f3d0` |
| Avertissement / en attente | `#fffbeb` | `#92400e` | `#fde68a` |
| Danger / saturé | `#fef2f2` | `#991b1b` | `#fecaca` |
| Information | `#eff6ff` | `#1e40af` | `#bfdbfe` |
| Neutre | `#f8fafc` | `#475569` | `#e2e8f0` |

Classes : `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`, `.badge-gray` (+ `.badge-dot` pour le point de statut).

### 2.4 Dataviz (ordre des séries Recharts)

`chart-1 #4f46e5` → `chart-2 #0ea5e9` → `chart-3 #10b981` → `chart-4 #f59e0b` → `chart-5 #ef4444` → `chart-6 #8b5cf6` → `chart-7 #14b8a6` → `chart-8 #64748b`.
Jamais plus de 6 séries par graphique ; dégradés de transparence 0.15–0.35 pour les aires.

---

## 3. Typographie

**Famille** : Inter (Google Fonts), fallback `system-ui`. **Mono** : pile système (`ui-monospace`) pour les codes (`code_pos`, `master_sim_number`, matricules).

<!-- SUITE-TYPO -->

| Élément | Taille / Graisse | Classes |
|---|---|---|
| Titre de page | 24 px / 700 | `text-2xl font-bold tracking-tight text-slate-900` |
| Titre de section (card) | 16 px / 600 | `text-base font-semibold` |
| KPI | 30 px / 800 | `text-3xl font-extrabold tracking-tight` |
| Corps / cellules | 14 px / 400–600 | `text-sm` |
| Labels de formulaires | 13 px / 600 | `.label` |
| En-têtes de colonnes | 11 px / 700 / uppercase / 0.06em | `.data-table thead th` |
| Légendes, aide | 12 px / 400 | `.field-help`, `text-xs` |
| Sur-labels | 11 px / 700 / uppercase / 0.08em | `.section-label` |

**Règles**
- Chiffres en contexte tabulaire : `tabular-nums` (KPI, colonnes de montants).
- Codes métier : `font-mono font-semibold text-brand-600`.
- Interligne : 1.5 corps de texte, 1.25 UI compacte.

---

## 4. Espacements (base 4 px)

| Contexte | Valeur |
|---|---|
| Padding de page | `p-4` mobile → `p-6` desktop (`md:`) |
| Padding carte (`.card-body`) | 20 px (`p-5`) |
| Padding en-tête de carte | 16 px 20 px |
| Gaps de grilles KPI | `gap-4` (16 px) |
| Gaps entre sections | `space-y-6` (24 px) |
| Gaps de formulaires | `gap-5` verticaux, `gap-4` en colonnes |
| Chips / badges | padding interne 2–6 px, gap 6 px |

Ne jamais imbriquer deux paddings pleins (ex. carte dans carte) : réduire d'un cran.

## 5. Rayons

| Élément | Rayon |
|---|---|
| Inputs / boutons | 10 px (`rounded-[0.625rem]`) |
| Cartes | 14 px (`.card` → 0.875rem) |
| Pastilles actives (segmented) | 10 px |
| Badges / chips / dots | 9999 px (pill) |
| Modales | 16 px |

## 6. Ombres & élévation (teintées slate, 2 couches)

| Token | Valeur | Usage |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgb(15 23 42/.05)` | Inputs, boutons |
| `shadow-sm` | + `0 1px 3px rgb(15 23 42/.06)` | Cartes (`.card`) |
| `shadow-md` | + `0 4px 8px rgb(15 23 42/.07)` | Hover de carte, dropdowns |
| `shadow-lg` | + `0 12px 24px rgb(15 23 42/.10)` | Popovers, sidebar mobile |
| `shadow-xl` | + `0 24px 48px rgb(15 23 42/.14)` | Modales |
| `shadow-ring` | `0 0 0 1px rgb(15 23 42/.05)` | Variante « bordure seule » |

Règle : **zéro ombre colorée** sur les boutons ; l'élévation se gagne au hover, jamais au repos pour les contrôles.

<!-- SUITE-ETATS -->

## 7. États interactifs

| État | Spécification |
|---|---|
| **Hover** | Changement de fond/bordure 150 ms ; cartes : `translateY(-2px)` + `shadow-md` |
| **Focus clavier** | `:focus-visible` → outline 2 px `brand-500` offset 2 px (global) ; champs : ring `--focus-ring` |
| **Active** | Boutons : `scale(0.98)` 100 ms |
| **Disabled** | Opacité 0.45 + `cursor: not-allowed` |
| **Loading bouton** | `.btn-loading` → spinner 1em avant le label + `aria-busy="true"` |
| **Champ erreur** | Bordure `#f87171` + `aria-invalid="true"` + ring rouge au focus + `.field-error` (role=alert) |
| **Champ disabled** | Fond `--surface-sunken`, texte `slate-400` |
| **Ligne sélectionnée** | Fond `#eef2ff` (`.row-selected`) |
| **Squelette** | `.skeleton` shimmer 1.5 s — jamais de spinner plein écran pour du contenu local |

## 8. Mouvement

- Durées : **150 ms** (micro-interactions), **200 ms** (cartes/élévation), **300 ms** (entrées de page).
- Easing : `ease-out` par défaut ; entrées de page `animate-fade-in` + `stagger-1…6` (délais 50 ms).
- `prefers-reduced-motion: reduce` → toutes animations/transition ≈ 0 (implémenté).

## 9. Composants

### 9.1 Classes du design system (`index.css`)

| Classe | Rôle |
|---|---|
| `.btn` + `.btn-primary/secondary/ghost/success/danger/warning/gray/indigo` + `.btn-sm/.btn-lg/.btn-icon/.btn-loading` | Boutons |
| `.badge` + `.badge-*` + `.badge-dot` + `.badge-sm` | Pastilles de statut |
| `.card` `.card-elevated` `.card-interactive` `.card-hover` `.card-header/body/footer` | Cartes |
| `.input` `.select` `.textarea` `.checkbox` `.radio` `.label` `.field-help` `.field-error` | Formulaires |
| `.data-table` (+ `.dense`, `.sortable`, `.row-selected`, `.sticky-header`) | Tableaux |
| `.chip` | Filtres actifs supprimables |
| `.skeleton`, `.section-label`, `.glass*`, `.bg-gradient-brand/subtle`, `.bg-mesh-pattern` | Utilitaires |
| `.animate-fade-in`, `.animate-slide-up`, `.stagger-1…6` | Animations |

### 9.2 Composants React (`src/components/Common/`)

| Composant | Props clés | Usage |
|---|---|---|
| `Button` | `variant, size, type, disabled` | Actions |
| `Badge` | `color, count` | Compteurs, tags simples |
| `StatusPill` | `status, color?, dot=true, size` | **Statuts métier** (couleur auto : actif→succès, en_attente→warning, saturee→danger…) |
| `DataTable` | `columns, rows, rowKey, loading, error, onRetry, onRowClick, selectable, selectedKeys, onSelectionChange, sortable, initialSort, dense, stickyHeader, empty*` | **Toutes les listes** |
| `SearchFilterBar` | `search/onSearchChange, filters[], activeFilters[], onReset, actions, resultCount` | En-tête des pages de listes |
| `Pagination` | `page, pageSize, total, onPageChange` | Sous chaque DataTable paginée |
| `FormField` | `label, htmlFor, required, error, help` + `children` | Wrapper de champs |
| `Stepper` | `steps[], current, onStepClick?` | Formulaires multi-étapes |
| `SegmentedControl` | `options[], value, onChange, size` | Bascule Liste ↔ Carte |
| `StatCard` | `label, value, accent, icon, subtitle, small, loading, trend` | KPI (trend = delta coloré) |
| `PageHeader` | `title, subtitle, actions, breadcrumbs` | En-tête de page |
| `EmptyState` / `ErrorState` / `Alert` / `LoadingSpinner` | — | États globaux (existants, conservés) |

### 9.3 Recette d'une page de liste (standard)

```jsx
<PageHeader title="Partenaires" actions={<Button variant="primary">+ Nouveau</Button>} />
<SearchFilterBar search={q} onSearchChange={setQ}
  filters={[{ key: 'statut', label: 'Statut : tous', value: statut,
              options: STATUTS, onChange: setStatut }]}
  activeFilters={[...]} onReset={reset} resultCount={filtered.length}
  actions={<ExportButtons rows={filtered} columns={COLS} fileName="partenaires" />} />
<div className="card overflow-hidden">
  <DataTable columns={COLS} rows={paged} loading={loading} error={err} onRetry={reload}
    rowKey="id" selectable={false} dense />
  <div className="card-footer"><Pagination page={page} pageSize={20} total={filtered.length} onPageChange={setPage} /></div>
</div>
```

### 9.4 Colonnes de table — règles de priorisation

1. **Identité** (code, nom) — toujours visible, mono/semibold pour le code.
2. **Statut** — `StatusPill`, visible.
3. **Métrique clé** (POS count, montant) — alignée à droite, `tabular-nums`.
4. **Métadonnées** (contacts, dates) → `responsive: 'hidden xl:table-cell'`.
5. **Actions** — 1 lien + menu `⋯` si > 2 actions.

<!-- SUITE-ICONS -->

## 10. Icônes

- Bibliothèque : **Heroicons v2** (`@heroicons/react`).
- Tailles : `h-4 w-4` (inline boutons/badges), `h-5 w-5` (navigation), `h-8 w-8` (états vides).
- Style : `24/outline` par défaut ; `20/solid` uniquement pour check/flèches compactes.
- Toujours `aria-hidden="true"` quand le libellé est adjacent ; jamais d'icône seule sans `aria-label`.

## 11. Accessibilité (WCAG 2.1 AA)

| Exigence | Implémentation |
|---|---|
| Contraste texte | `slate-900/700` sur blanc ✓ ; `brand-600` min. pour texte de marque ✓ |
| Focus visible | Global `:focus-visible` outline + rings dédiés (inputs) |
| Formulaires | `label[htmlFor]` obligatoire, erreurs `role="alert"`, `aria-invalid` |
| Tableaux | `scope="col"`, `aria-sort` sur les th triés, cases à cocher labellisées |
| Statuts | Couleur **jamais seule** : dot + libellé texte |
| Motion | `prefers-reduced-motion` respecté |
| Langue | Interface 100 % FR, messages d'état explicites |

## 12. Gouvernance

- **Ajouter un token** : d'abord dans `@theme` (génère les utilitaires), alias `:root` si consommé par la couche composants ; documenter ici.
- **Ajouter un composant** : dossier `Common/<Nom>/<Nom>.jsx` + `<Nom>.test.jsx`, JSDoc FR, props documentées, aucun style local qui duplique un token.
- **Interdits** : dégradés sur contrôles interactifs, ombres colorées, couleurs hors palette (hex brut dans un composant), `text-brand-400` sur fond blanc, spinner plein écran pour un chargement partiel.



