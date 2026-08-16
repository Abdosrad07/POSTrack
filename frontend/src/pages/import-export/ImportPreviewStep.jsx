import React from 'react';
import ImportBatchTable from '../../components/Import/ImportBatchTable';
import ErrorReportViewer from '../../components/Import/ErrorReportViewer';

/**
 * Étape 4 du workflow A3 : Prévisualisation du lot validé & rapport d'erreurs.
 */
const ImportPreviewStep = ({ batch, onOpenModal, onReset }) => {
  const errorCount = batch?.summary?.errors ?? batch?.errors?.length ?? 0;

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">4. Prévisualisation & Rapport</h2>
            <p className="mt-1 text-sm text-slate-500">
              {batch?.file_name} — {batch?.entity_type} (lot {batch?.id})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReset}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Nouvel import
            </button>
            <button
              type="button"
              onClick={onOpenModal}
              disabled={errorCount > 0}
              className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed ${
                errorCount > 0 ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              5. Appliquer l'import
            </button>
          </div>
        </div>
        <div className="mt-5">
          <ImportBatchTable batch={batch} />
        </div>
        <div className="mt-5">
          <ErrorReportViewer errors={batch?.errors} warnings={batch?.warnings} />
        </div>
      </section>
    </div>
  );
};

export default ImportPreviewStep;