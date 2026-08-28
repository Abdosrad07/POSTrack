import React from 'react';
import { MagnifyingGlassIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Barre de recherche + filtres + chips actifs — standard des pages de listes.
 *
 * @param {Object} props
 * @param {string} [props.search]              Valeur de la recherche
 * @param {(v: string) => void} [props.onSearchChange]
 * @param {string} [props.searchPlaceholder]   Placeholder du champ recherche
 * @param {Array}  [props.filters]             [{ key, label, value, options, onChange }]
 * @param {Array}  [props.activeFilters]       [{ label, onRemove }]
 * @param {() => void} [props.onReset]         Réinitialise tous les filtres
 * @param {import('react').ReactNode} [props.actions]
 * @param {number} [props.resultCount]         Compteur de résultats
 * @param {string} [props.className]
 */
const SearchFilterBar = ({
  search = '',
  onSearchChange = /** @type {(value: string) => void} */ (undefined),
  searchPlaceholder = 'Rechercher…',
  filters = /** @type {any[]} */ ([]),
  activeFilters = /** @type {any[]} */ ([]),
  onReset = /** @type {() => void} */ (undefined),
  actions = /** @type {any} */ (undefined),
  resultCount = /** @type {number} */ (undefined),
  className = '',
}) => (
  <div className={`space-y-3 ${className}`}>
    <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
        {onSearchChange && (
          <div className="relative sm:max-w-xs sm:flex-1">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              className="input pl-9"
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {search ? (
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                aria-label="Effacer la recherche"
                onClick={() => onSearchChange('')}
              >
                <XCircleIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        )}

        {filters.map((filter) => (
          <select
            key={filter.key}
            className="select sm:w-44"
            aria-label={filter.label}
            value={filter.value ?? ''}
            onChange={(e) => filter.onChange?.(e.target.value)}
          >
            <option value="">{filter.label}</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {resultCount != null && (
          <p className="whitespace-nowrap text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{resultCount}</span> résultat
            {resultCount > 1 ? 's' : ''}
          </p>
        )}
        {actions}
      </div>
    </div>

    {activeFilters.length > 0 || (onReset && search) ? (
      <div className="flex flex-wrap items-center gap-2">
        {activeFilters.map((af, index) => (
          <span key={`${af.label}-${index}`} className="chip">
            {af.label}
            {af.onRemove ? (
              <button
                type="button"
                onClick={af.onRemove}
                aria-label={`Retirer le filtre ${af.label}`}
              >
                <XMarkIcon className="h-3 w-3" aria-hidden="true" />
              </button>
            ) : null}
          </span>
        ))}
        {onReset && activeFilters.length > 0 ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
            Réinitialiser
          </button>
        ) : null}
      </div>
    ) : null}
  </div>
);

export default SearchFilterBar;
