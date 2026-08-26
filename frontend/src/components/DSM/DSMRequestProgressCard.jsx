import React from 'react';

const formatPct = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '0%';
  return `${Math.min(100, Math.max(0, Number(value))).toFixed(1)}%`;
};

const DSMRequestProgressCard = ({ data }) => {
  const { total, en_cours, terminees, en_retard, progression } = data || {};

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Progression des requêtes</h3>
        <p className="text-sm text-slate-500">Évolution détaillée des requêtes du DSM</p>
      </div>

      {/* Représentation progressive */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Progression globale</span>
          <span className="font-bold text-slate-900">{formatPct(progression)}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div 
            className="h-full rounded-full bg-emerald-500 transition-all duration-300" 
            style={{ width: `${progression || 0}%` }}
          />
        </div>
      </div>

      {/* Indicateurs détaillés */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</div>
          <div className="mt-1 text-xl font-bold text-slate-900">{total || 0}</div>
          <div className="text-xs text-slate-600">Requêtes totales</div>
        </div>
        
        <div className="rounded-lg bg-amber-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">En cours</div>
          <div className="mt-1 text-xl font-bold text-slate-900">{en_cours || 0}</div>
          <div className="text-xs text-slate-600">Requêtes actives</div>
        </div>
        
        <div className="rounded-lg bg-emerald-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Terminées</div>
          <div className="mt-1 text-xl font-bold text-slate-900">{terminees || 0}</div>
          <div className="text-xs text-slate-600">Requêtes clôturées</div>
        </div>
        
        <div className="rounded-lg bg-red-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">En retard</div>
          <div className="mt-1 text-xl font-bold text-slate-900">{en_retard || 0}</div>
          <div className="text-xs text-slate-600">Hors délai</div>
        </div>
      </div>

      {/* Note explicative */}
      <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
        <strong>ℹ️ Note :</strong> Cette vue présente uniquement les requêtes spécifiques à ce DSM, 
        pas les chiffres globaux du partenaire. La progression est calculée comme : 
        (terminées / total) × 100.
      </div>
    </div>
  );
};

export default DSMRequestProgressCard;