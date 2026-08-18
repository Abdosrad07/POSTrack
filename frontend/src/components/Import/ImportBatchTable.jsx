import React from 'react';

const summaryBadge = (label, value, color) => (
  <div className="rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200">
    <div className="text-lg font-bold text-slate-900">{value}</div>
    <div className={`text-xs font-medium ${color}`}>{label}</div>
  </div>
);

/**
 * Tableau de prévisualisation des lignes d'un lot validé (Module A3 — étape 4).
 */
const ImportBatchTable = ({ batch }) => {
  const columns = batch?.columns || [];
  const rows = batch?.rows || [];
  const summary = batch?.summary || {};

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summaryBadge('Total lignes', summary?.total_lines ?? rows.length, 'text-slate-500')}
        {summaryBadge('Créations', summary?.created ?? 0, 'text-indigo-600')}
        {summaryBadge('Mises à jour', summary?.updated ?? 0, 'text-sky-600')}
        {summaryBadge(
          'Erreurs',
          summary?.errors ?? 0,
          (summary?.errors || 0) > 0 ? 'text-red-600' : 'text-green-600'
        )}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          Aucune ligne à prévisualiser.
        </p>
      ) : (
        <div className="max-h-96 overflow-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-max divide-y divide-slate-200 text-left text-sm">
            <thead className="sticky top-0 bg-slate-100">
              <tr>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ligne
                </th>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {col}
                  </th>
                ))}
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row) => (
                <tr key={row.row_number} className={row.valid ? '' : 'bg-red-50'}>
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-600">
                    {row.row_number}
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col}
                      className={`px-3 py-2 whitespace-nowrap ${row.valid ? 'text-slate-700' : 'text-red-700'}`}
                    >
                      {row.cells?.[col] ?? '—'}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-3 py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        row.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {row.valid ? 'OK' : 'Erreur'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ImportBatchTable;