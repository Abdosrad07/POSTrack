# POSTrack — Guide d'Implémentation du Design System v2

> Comment intégrer la refonte, par ordre de priorité, sans big-bang.
> Public : développeurs frontend. Références : `DESIGN_SYSTEM.md`, `WIREFRAMES.md`.

---

## 0. Ce qui est déjà livré (Phase 0 — fait)

| Livrable | Fichiers |
|---|---|
| **FIX critique** : les classes `brand-*` ne généraient aucun CSS (`--brand-*` dans `:root` sans `@theme`). Désormais enregistrées dans `@theme` Tailwind v4 → les 56 usages `text-brand-600`, `bg-brand-50`… fonctionnent | `frontend/src/index.css` |
| Refonte de la couche composants CSS : boutons plats premium + `.btn-loading`, badges avec bordure teintée + `.badge-dot`, cartes (`.card-interactive`, `.card-footer`), formulaires (`.textarea`, `.checkbox`, `.label`, `.field-help`, `.field-error`, états `aria-invalid`), ombres slate 2 couches, dataviz `chart-1…8` | `frontend/src/index.css` |
| `prefers-reduced-motion` (WCAG 2.3.3) | `frontend/src/index.css` |
| Nouveaux composants **testés** : `DataTable`, `SearchFilterBar`, `Pagination`, `StatusPill`, `Stepper`, `FormField`, `SegmentedControl` (+ props TS grâce aux @param objet) | `frontend/src/components/Common/<Nom>/` |
| `StatCard` enrichi (prop `trend`) | `frontend/src/components/Dashboard/StatCard.jsx` |
| **P1 — pages de listes migrées** : `PartnersList` (15 colonnes → 8 visibles + filtres + chips + pagination), `POSListPage` (PageHeader, onglets brand, ErrorState/EmptyState, Pagination commune), `POSTable` (design system + StatusPill), `POSFilters` (classes DS), `RequetesListPage` (DataTable + StatusPill retard/saturé), `PrimesListPage` (DataTable dense + StatusPill) | `frontend/src/pages/*` + `components/POS/*` |
| **P2 — formulaires migrés** : `POSCreatePage`, `PartenaireCreatePage` (validation champ par champ, FormField, boutons Annuler/Créer), en-têtes `PageHeader` sur `BTSCreatePage` | `frontend/src/pages/pos|partenaires|bts/*` |
| Correctifs build tsc (`ExportButtons` props typées, `Prime.commentaire`, props des composants Common compatibles TSX) | fichiers correspondants |
| Validation : **build de production OK** (`npm run build` exit 0) · **31 nouveaux tests verts** · suite complète : 41 fichiers passent, 5 échecs pré-existants hors périmètre (WIP `NavLevelContext`/`App.test`/`exportData`/`roles`) | — |

> Impact immédiat pour les utilisateurs : tous les accents de marque s'affichent désormais correctement, les contrôles ont des états complets (focus/erreur/loading), l'animation respecte les préférences système.

---

## 1. Priorisation de la migration

### P0 — Fondations (fait, voir §0)

### P1 — Pages de listes (terminé pour l'essentiel ✅)

`PartnersList`, `POSListPage` (+ `POSTable`/`POSFilters`), `RequetesListPage`, `PrimesListPage` sont migrés sur le trio `SearchFilterBar + DataTable + Pagination` + `StatusPill`.

Encore à faire :
- [ ] `BTSListPage` — remplacement du `getStatusStyle` par `StatusPill` (mapping maintenance→warning, hors_service→danger déjà couvert)
- [ ] `SimsStockPage`, `SuiviVentesPage`, `DSMListPage` — même schéma
- [ ] Colonnes secondaires en `responsive: 'hidden xl:table-cell'`

### P2 — Formulaires (terminé pour les pages de création ✅)

`POSCreatePage` et `PartenaireCreatePage` sont migrés (FormField + validation champ par champ + boutons Annuler/Créer + bouton `.btn-loading` à l'envoi). Restes :
- [ ] `POSEditPage` / `BTSCreatePage` → sections en 2 colonnes (`grid sm:grid-cols-2 gap-4`)
- [ ] `ReconductionCreatePage`, `RequeteCreatePage` → récapitulatif avant submit + `.btn-loading`
- [ ] Wizard `Stepper` (Identité / Localisation / Confirmation) sur `POSCreatePage` uniquement si l'API le justifie (actuellement le POST ne porte que serial/modèle/partenaire)

<!-- SUITE-GUIDE2 -->

### P3 — Dashboards & finitions (~1 semaine)

1. KPI : `StatCard` avec `trend` (delta vs période précédente) ; accent cohérent (vert = bon, rouge = alerte — inverser via `positive: false` pour « requêtes ouvertes »).
2. Graphiques : séries dans l'ordre `chart-1…8`, grilles `slate-100`, tooltips arrondis, `tabular-nums` sur les axes.
3. `Sidebar` / `Header` : supprimer les dégradés restants sur les items actifs (fond `brand-600` plat), bandeaux de niveau (DSM/POS) conservés.
4. `LoginPage` : garder le mesh + bandeau dégradé ; passer les champs sur `FormField`.
5. Performance : lazy-load `react-leaflet` (uniquement sur les pages carte), `React.lazy` sur les routes secondaires ; vérifier que `animate-*` n'anime que `transform/opacity`.

### P4 — Adaptation par rôle (affinage)

| Rôle | Focus |
|---|---|
| **ADMIN** | Dashboard analytique : KPI réseau + santé système (BTS saturées en alerte), gestion partenaires |
| **PARTNER** | Portefeuille POS, primes (montants `tabular-nums` + FCFA), stats ventes |
| **DSM** | Territoire (carte par défaut), performance BTS, file de requêtes |
| **USER** | Opérations quotidiennes : actions POS en 1 clic, formulaires courts |

---

## 2. Règles de migration progressive

1. **Une page = une PR** — jamais de refonte transversale multi-pages.
2. **Compatibilité** : les classes historiques (`.btn`, `.card`, `.badge`, `.input`, `.skeleton`…) sont conservées — les pages migrées et non migrées restent cohérentes pendant la transition.
3. **Pas de duplication** : si un style existe dans `index.css`, ne pas le réécrire en Tailwind inline.
4. **Tests d'abord** : importer le composant, adapter le test existant de la page, puis remplacer le markup.
5. **Revue visuelle** : chaque PR inclut des captures desktop (1280) + mobile (375) des 4 états (loading/vide/erreur/succès).

## 3. Recette qualité (checklist par page)

- [ ] Clavier : tabulation ordonnée, focus visible sur tous les contrôles, `Escape` ferme les overlays
- [ ] Contraste : aucun texte < 4.5:1 (vérifier les `slate-400` → réservés aux placeholders/disabled)
- [ ] Responsive : 375 / 768 / 1280 — pas de scroll horizontal involontaire hors tableau
- [ ] États : loading (squelettes), vide (EmptyState), erreur (ErrorState), succès (confirmation)
- [ ] `aria-*` : `aria-sort` (tables), `aria-invalid` + `role="alert"` (formulaires), `aria-busy` (boutons loading)
- [ ] Réduced motion : activer « réduire les animations » dans l'OS → aucune animation résiduelle
- [ ] Print : `.no-print` sur Header/Sidebar/filtres ; exports PDF inchangés

## 4. Pièges connus (spécifiques au repo)

- **Tailwind v4** : tout nouveau token de couleur DOIT vivre dans `@theme` (`--color-<nom>-<nuance>`), pas seulement `:root` — sinon l'utilitaire n'est pas généré (cause du bug initial `brand-*`).
- **Props de composants .jsx consommés en .tsx** : fournir des valeurs par défaut typées (`/** @type {any[]} */ ([])`) — l'inférence TS ne lit pas les `@param` JSDoc sans `checkJs`.
- **Recharts** : toujours `ResponsiveContainer` avec hauteur explicite sur le parent.
- **Leaflet** : importer `leaflet/dist/leaflet.css` une seule fois ; z-index des popups < header (h-16).

## 5. Commandes utiles

```bash
cd frontend
npm run dev          # serveur de dev (proxy /api → 127.0.0.1:8000)
npm run test:run     # suite vitest
npx vitest run src/components/Common/DataTable   # un seul composant
npm run build        # tsc -b && vite build (validation complète)
```

