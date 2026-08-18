import React from 'react';

/**
 * Rapport d'erreurs ligne/colonne d'un lot d'import (Module A3 — étape 4).
 * Affiche les erreurs et les avertissements détectés lors de la validation.
 */
const ErrorReportViewer = ({ errors = [], warnings = [], emptyMessage = "Aucune erreur détectée." }) => {
  const all = [
    ...(errors || []).map((e) => ({ ...e, severity: e.severity || 'ERROR' })),
    ...(warnings || []).map((w) => ({ ...w, severity: w.severity || 'WARNING' })),
  ];

  if (!all.length) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        {emptyMessage}
      </div>
    );
  }

  const severityClasses = {
    ERROR: 'bg-red-100 text-red-800',
    WARNING: 'bg-yellow-100 text-yellow-800',
    INFO: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="grid grid-cols-2 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
            {errors?.length || 0}
          </span>
          <span className="font-medium text-slate-700">Erreurs</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
            {warnings?.length || 0}
          </span>
          <span className="font-medium text-slate-700">Avertissements</span>
        </div>
      </div>

      {all.length ? (
        <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto">
          {all.map((item, index) => (
            <li key={`${item.row}-${item.column}-${index}`} className="px-4 py-2.5">
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                    severityClasses[item.severity] || severityClasses.INFO
                  }`}
                >
                  {item.severity}
                </span>
                <span className="font-medium text-slate-800">Ligne {item.row}</span>
                {item.column ? (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600">
                    {item.column}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-slate-600">{item.message}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default ErrorReportViewer;