import React from 'react';

const SIZES = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
};

/**
 * Contrôle segmenté — bascule de vue (ex. Liste | Carte sur les POS).
 * Pattern « track gris + pastille blanche active » (style Linear).
 *
 * @param {Object} props
 * @param {Array}  [props.options]      [{ value, label, icon? }]
 * @param {any}    [props.value]        Valeur active
 * @param {(value: any) => void} [props.onChange]
 * @param {string} [props.size]         'sm' | 'md'
 * @param {string} [props.className]
 * @param {string} [props['aria-label']] Libellé d'accessibilité
 */
const SegmentedControl = ({
  options = /** @type {any[]} */ ([]),
  value = /** @type {any} */ (undefined),
  onChange = /** @type {(value: any) => void} */ (undefined),
  size = 'md',
  className = '',
  'aria-label': ariaLabel = 'Affichage',
}) => (
  <div
    role="group"
    aria-label={ariaLabel}
    className={`inline-flex items-center gap-0.5 rounded-xl border border-slate-200 bg-slate-100 p-0.5 ${className}`}
  >
    {options.map((option) => {
      const active = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          aria-pressed={active}
          onClick={() => !active && onChange?.(option.value)}
          className={`inline-flex items-center gap-1.5 rounded-[0.625rem] font-semibold transition-all duration-150 ${
            SIZES[size] || SIZES.md
          } ${active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          {option.icon}
          {option.label}
        </button>
      );
    })}
  </div>
);

export default SegmentedControl;
