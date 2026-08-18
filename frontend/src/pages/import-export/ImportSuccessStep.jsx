import React from 'react';

/**
 * Étape finale du workflow A3 : confirmation d'un import appliqué avec succès.
 */
const ImportSuccessStep = ({ batch, result, onReset }) => {
  const summary = result?.summary || batch?.summary || {};
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
      <svg
        className="mx-auto mb-3 h-12 w-12 text-green-600"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75l2.25 2.25L15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2 className="text-lg font-semibold text-green-900">Import appliqué avec succès</h2>
      <p className="mt-2 text-sm text-green-700">
        {summary?.created ?? 0} création(s), {summary?.updated ?? 0} mise(s) à jour pour le lot{' '}
        {batch?.id}.
      </p>
      <div className="mt-6">
        <button
          type="button"
          onClick={onReset}
          className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Nouvel import
        </button>
      </div>
    </div>
  );
};

export default ImportSuccessStep;