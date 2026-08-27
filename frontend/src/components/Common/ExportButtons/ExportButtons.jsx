import { useCallback, useState } from 'react';
import {
  CodeBracketIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';
import { exportExcel, exportJSON, exportPDF } from '../../../utils/exportData';

/**
 * Barre d'export d'une page de données : PDF / Excel / JSON.
 *
 * @param {object}   props
 * @param {Array}    props.rows      Lignes affichées sur la page (données API normalisées).
 * @param {Array}    props.columns   Descriptif des colonnes { label, value } (voir utils/exportData).
 * @param {string}   props.fileName  Base du nom de fichier généré (ex. 'partenaires').
 * @param {string}  [props.title]    Titre imprimé dans l'en-tête du PDF.
 * @param {string}  [props.subtitle] Sous-titre du PDF (ex. nom du partenaire actif).
 * @param {boolean} [props.disabled] Désactive les boutons (chargement en cours).
 */
const EXPORT_BUTTONS = [
  { key: 'pdf', label: 'PDF', icon: DocumentArrowDownIcon },
  { key: 'excel', label: 'Excel', icon: TableCellsIcon },
  { key: 'json', label: 'JSON', icon: CodeBracketIcon },
];

export default function ExportButtons({
  rows = [],
  columns = [],
  fileName,
  title,
  subtitle,
  disabled = false,
}) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleExport = useCallback(
    (format) => {
      if (!rows || rows.length === 0) return;
      setMessage('');
      setError('');
      try {
        let result;
        if (format === 'pdf') {
          result = exportPDF(rows, fileName, columns, { title, subtitle });
        } else if (format === 'excel') {
          result = exportExcel(rows, fileName, columns);
        } else {
          result = exportJSON(rows, fileName);
        }
        setMessage(`${result.count} ligne(s) exportée(s) (${result.fileName}).`);
      } catch (err) {
        console.error('Échec de l’export :', err);
        setError("L'export a échoué.");
      }
    },
    [columns, fileName, rows, subtitle, title],
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
        Exporter
      </span>
      {EXPORT_BUTTONS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          data-testid={`export-${key}`}
          onClick={() => handleExport(key)}
          disabled={disabled || !rows || rows.length === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Exporter en ${label}`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </button>
      ))}
      {message ? (
        <span role="status" data-testid="export-status" className="text-xs font-medium text-emerald-600">{message}</span>
      ) : null}
      {error ? (
        <span role="alert" data-testid="export-error" className="text-xs font-medium text-red-600">{error}</span>
      ) : null}
    </div>
  );
}
