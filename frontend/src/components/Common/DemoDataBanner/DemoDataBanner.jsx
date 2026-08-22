import React from 'react';

/**
 * Bandeau indiquant que les données affichées proviennent du mode démo
 * (backend indisponible, partenaires marqués `__mock: true`).
 */
const DemoDataBanner = ({ message, compact = false, className = '' }) => {
  const defaultMessage =
    "Le backend est momentanément indisponible : les données affichées sont des données de démonstration et ne reflètent pas l'état réel de la plateforme.";

  if (compact) {
    return (
      <div
        className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 border-t border-amber-200 bg-amber-50 px-4 py-1.5 text-xs text-amber-900 ${className}`}
      >
        <span aria-hidden="true">⚠️</span>
        <span className="font-semibold">Données de démo</span>
        <span>{message || defaultMessage}</span>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 ${className}`}>
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="text-lg">⚠️</span>
        <div className="text-sm text-amber-900">
          <p className="font-semibold">Données de démo</p>
          <p className="mt-0.5 text-xs text-amber-800">{message || defaultMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default DemoDataBanner;