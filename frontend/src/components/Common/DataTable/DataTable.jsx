import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline';
import EmptyState from '../EmptyState/EmptyState';
import ErrorState from '../ErrorState/ErrorState';

/**
 * Tableau de données générique — design system POSTrack v2.
 * Remplace les <table> codées à la main dans chaque page.
 *
 * Colonnes : { key, header, render?, align?, width?, sortable?,
 *              className?, headerClassName?, responsive?, sortValue? }
 *   - render(row)  : cellule personnalisée
 *   - responsive   : ex. 'hidden lg:table-cell' (tables à N colonnes)
 *   - sortValue(row) : valeur de tri personnalisée
 *
 * États intégrés : loading (squelettes), error (ErrorState + onRetry),
 * vide (EmptyState), tri, sélection, lignes cliquables.
 *
 * @param {Object} props
 * @param {Array}  [props.columns]
 * @param {Array}  [props.rows]
 * @param {string|((row: any, i: number) => any)} [props.rowKey]
 * @param {boolean} [props.loading]
 * @param {string|null} [props.error]
 * @param {() => void} [props.onRetry]
 * @param {(row: any) => void} [props.onRowClick]
 * @param {boolean} [props.selectable]
 * @param {Array}  [props.selectedKeys]
 * @param {(keys: any[]) => void} [props.onSelectionChange]
 * @param {boolean} [props.sortable]
 * @param {{key: string, direction: 'asc' | 'desc'} | null} [props.initialSort]
 * @param {boolean} [props.dense]
 * @param {boolean} [props.stickyHeader]
 * @param {number}  [props.skeletonRows]
 * @param {string}  [props.emptyTitle]
 * @param {string}  [props.emptyMessage]
 * @param {string}  [props.emptyActionLabel]
 * @param {() => void} [props.onEmptyAction]
 * @param {(row: any) => string} [props.rowClassName]
 * @param {string}  [props.className]
 */
const DataTable = ({
  columns = /** @type {any[]} */ ([]),
  rows = /** @type {any[]} */ ([]),
  rowKey = 'id',
  loading = false,
  error = /** @type {string | null} */ (null),
  onRetry = /** @type {() => void} */ (undefined),
  onRowClick = /** @type {(row: any) => void} */ (undefined),
  selectable = false,
  selectedKeys = /** @type {any[]} */ ([]),
  onSelectionChange = /** @type {(keys: any[]) => void} */ (undefined),
  sortable = true,
  initialSort = /** @type {{ key: string, direction: 'asc' | 'desc' } | null} */ (null),
  dense = false,
  stickyHeader = false,
  skeletonRows = 6,
  emptyTitle = 'Aucune donnée',
  emptyMessage = 'Aucun élément à afficher pour le moment.',
  emptyActionLabel = /** @type {string} */ (undefined),
  onEmptyAction = /** @type {() => void} */ (undefined),
  rowClassName = /** @type {(row: any) => string} */ (undefined),
  className = '',
}) => {
  const [sort, setSort] = useState(initialSort);
  const headerCheckboxRef = useRef(null);

  const keyOf = (row, index) =>
    typeof rowKey === 'function' ? rowKey(row, index) : row?.[rowKey] ?? index;

  const sortedRows = useMemo(() => {
    if (!sort || !sortable) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const dir = sort.direction === 'desc' ? -1 : 1;
    const value = (row) => (col.sortValue ? col.sortValue(row) : row[col.key]);
    return [...rows].sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return (
        String(va).localeCompare(String(vb), 'fr', { numeric: true, sensitivity: 'base' }) * dir
      );
    });
  }, [rows, sort, sortable, columns]);

  const allSelected =
    rows.length > 0 && rows.every((row, i) => selectedKeys.includes(keyOf(row, i)));
  const someSelected = selectedKeys.length > 0 && !allSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? [] : rows.map((row, i) => keyOf(row, i)));
  };

  const toggleRow = (key) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedKeys.includes(key)
        ? selectedKeys.filter((k) => k !== key)
        : [...selectedKeys, key],
    );
  };

  const handleSort = (col) => {
    setSort((s) =>
      s?.key === col.key
        ? { key: col.key, direction: s.direction === 'asc' ? 'desc' : 'asc' }
        : { key: col.key, direction: 'asc' },
    );
  };

  const colSpan = columns.length + (selectable ? 1 : 0);
  const tableClasses = ['data-table', dense ? 'dense' : '', className].filter(Boolean).join(' ');

  return (
    <div className={`data-table-container overflow-x-auto ${stickyHeader ? 'sticky-header' : ''}`}>
      <table className={tableClasses}>
        <thead>
          <tr>
            {selectable && (
              <th scope="col" className="w-10">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  className="checkbox"
                  aria-label="Tout sélectionner"
                  checked={rows.length > 0 && allSelected}
                  disabled={loading || rows.length === 0}
                  onChange={toggleAll}
                />
              </th>
            )}
            {columns.map((col) => {
              const isSortable = sortable && col.sortable !== false;
              const thClass = [
                isSortable ? 'sortable' : '',
                col.headerClassName || '',
                col.responsive || '',
              ]
                .filter(Boolean)
                .join(' ');
              const active = sort?.key === col.key;
              const SortIcon = !active
                ? ChevronUpDownIcon
                : sort.direction === 'asc'
                  ? ChevronUpIcon
                  : ChevronDownIcon;
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={thClass}
                  style={col.width ? { width: col.width } : undefined}
                  aria-sort={
                    active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                  onClick={isSortable ? () => handleSort(col) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {isSortable && (
                      <SortIcon className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: skeletonRows }, (_, r) => (
              <tr key={`skeleton-${r}`} aria-hidden="true">
                {selectable && (
                  <td>
                    <div className="skeleton h-4 w-4 rounded" />
                  </td>
                )}
                {columns.map((col, c) => (
                  <td key={col.key} className={col.responsive || ''}>
                    <div
                      className="skeleton h-3.5 rounded"
                      style={{ width: `${45 + ((r * columns.length + c) * 13) % 40}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : error ? (
            <tr>
              <td colSpan={colSpan} className="p-6">
                <ErrorState message={typeof error === 'string' ? error : undefined} onRetry={onRetry} />
              </td>
            </tr>
          ) : sortedRows.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="p-6">
                <EmptyState
                  title={emptyTitle}
                  message={emptyMessage}
                  actionLabel={emptyActionLabel}
                  onAction={onEmptyAction}
                />
              </td>
            </tr>
          ) : (
            sortedRows.map((row, rowIndex) => {
              const key = keyOf(row, rowIndex);
              const isSelected = selectable && selectedKeys.includes(key);
              return (
                <tr
                  key={key}
                  className={`${isSelected ? 'row-selected' : ''} ${rowClassName?.(row) || ''} ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {selectable && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="checkbox"
                        aria-label={`Sélectionner la ligne ${rowIndex + 1}`}
                        checked={isSelected}
                        onChange={() => toggleRow(key)}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={[
                        col.align === 'right' ? 'text-right' : '',
                        col.align === 'center' ? 'text-center' : '',
                        col.className || '',
                        col.responsive || '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {col.render ? col.render(row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
