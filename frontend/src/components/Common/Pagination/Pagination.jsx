import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

/**
 * Pagination standardisée des listes POSTrack.
 * Rend « Affichage X–Y sur Z » + navigation numérotée avec ellipses.
 * Se masque automatiquement si total = 0.
 *
 * @param {Object} props
 * @param {number} [props.page]
 * @param {number} [props.pageSize]
 * @param {number} [props.total]
 * @param {(page: number) => void} [props.onPageChange]
 * @param {string} [props.className]
 */
const buildPageItems = (page, totalPages) => {
  const items = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i += 1) items.push(i);
    return items;
  }
  items.push(1);
  if (page > 3) items.push('ellipsis-left');
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i += 1) {
    items.push(i);
  }
  if (page < totalPages - 2) items.push('ellipsis-right');
  items.push(totalPages);
  return items;
};

const Pagination = ({
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange = /** @type {(page: number) => void} */ (undefined),
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);

  if (!total) return null;

  const from = (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, total);
  const items = buildPageItems(current, totalPages);

  return (
    <nav
      className={`flex flex-col items-center justify-between gap-3 sm:flex-row ${className}`}
      aria-label="Pagination"
    >
      <p className="text-sm text-slate-500">
        Affichage{' '}
        <span className="font-semibold text-slate-700">
          {from}–{to}
        </span>{' '}
        sur <span className="font-semibold text-slate-700">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="btn btn-sm btn-secondary"
          disabled={current === 1}
          aria-label="Page précédente"
          onClick={() => onPageChange?.(current - 1)}
        >
          <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
        </button>

        {items.map((item, index) =>
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              aria-current={item === current ? 'page' : undefined}
              className={`btn btn-sm ${item === current ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => onPageChange?.(item)}
            >
              {item}
            </button>
          ) : (
            <span key={`${item}-${index}`} className="px-1.5 text-sm text-slate-400" aria-hidden="true">
              …
            </span>
          ),
        )}

        <button
          type="button"
          className="btn btn-sm btn-secondary"
          disabled={current === totalPages}
          aria-label="Page suivante"
          onClick={() => onPageChange?.(current + 1)}
        >
          <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
