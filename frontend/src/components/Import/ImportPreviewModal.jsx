import React from 'react';
import ImportBatchTable from './ImportBatchTable';
import ErrorReportViewer from './ErrorReportViewer';
import LoadingSpinner from '../Common/LoadingSpinner/LoadingSpinner';

/**
 * Modal de prévisualisation / confirmation d'un lot d'import (Module A3 — étape 5).
 * Bloque explicitement le commit tant que des erreurs bloquantes subsistent.
 */
const ImportPreviewModal = ({ batch, open, onClose, onConfirm, confirming = false }) => {
  if (!open || !batch) return null;

  const errorCount = batch.summary?.errors ?? batch.errors?.length ?? 0;
  const hasBlockingErrors = errorCount > 0;

  const closeButton = (
    <button
      type="button"
      onClick={onClose}
      disabled={confirming}
      className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
    >
      Annuler
    </button>
  );

  const confirmButton = hasBlockingErrors ? (
    <span
      title="Corrigez le fichier et revalidez avant de commiter."
      className="rounded-md border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400"
    >
      Commit bloqué
    </span>
  ) : (
    <button
      type="button"
      onClick={onConfirm}
      disabled={confirming}
      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
    >
      {confirming ? 'Application en cours…' : "Confirmer & Commiter"}
    </button>
  );

  return (
    <div
      data-testid="import-preview-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Prévisualisation de l'import"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Prévisualisation de l'import</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {batch.file_name || 'Fichier'} — {batch.entity_type}
            </p>
          </div>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            disabled={confirming}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          <ImportBatchTable batch={batch} />
          <ErrorReportViewer errors={batch.errors} warnings={batch.warnings} />

          {hasBlockingErrors ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Des erreurs bloquantes sont présentes. Le commit est désactivé : corrigez le fichier
              puis revalidez l'import.
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          {confirming ? (
            <div className="mr-auto">
              <LoadingSpinner size="sm" label="Application du lot…" />
            </div>
          ) : null}
          {closeButton}
          {confirmButton}
        </div>
      </div>
    </div>
  );
};

export default ImportPreviewModal;