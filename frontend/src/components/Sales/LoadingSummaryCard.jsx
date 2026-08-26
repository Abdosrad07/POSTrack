import React, { useMemo, useState } from 'react';

const formatValue = (value) => {
  if (value === null || value === undefined) return 'Non renseigné';
  return new Intl.NumberFormat('fr-FR').format(Number(value));
};

const formatPct = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'Non renseigné';
  return `${Math.min(100, Math.max(0, Number(value))).toFixed(1)} %`;
};

const LoadingSummaryCard = ({ data, onPeriodChange }) => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const rows = useMemo(() => Array.isArray(data?.by_dsm) ? data.by_dsm : [], [data]);

  const applyFilter = (e) => {
    e.preventDefault();
    onPeriodChange?.({ period_start: start || undefined, period_end: end || undefined });
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Loading partenaire</h2>
          <p className="text-sm text-slate-500">Le loading représente ce que le marché a consommé.</p>
        </div>
        <form onSubmit={applyFilter} className="flex flex-wrap items-end gap-2 text-sm">
          <label className="space-y-1">
            <div className="text-slate-500">Du</div>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="space-y-1">
            <div className="text-slate-500">Au</div>
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <button type="submit" className="rounded-md bg-sky-600 px-4 py-2 font-medium text-white">Filtrer</button>
        </form>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric label="Réalisation" value={data?.loading} />
        <Metric label="Objectif" value={data?.objectif} />
        <Metric label="Progression" value={formatPct(data?.progression)} raw />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
        <div className="grid grid-cols-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <div>DSM</div>
          <div>Loading</div>
          <div>Objectif</div>
          <div>Progression</div>
        </div>
        <div className="divide-y divide-slate-200">
          {rows.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500">Aucune donnée disponible.</div>
          ) : rows.map((row) => (
            <div key={row.dsm_id} className="grid grid-cols-4 gap-2 px-4 py-3 text-sm">
              <div className="font-medium text-slate-900">{row.dsm_name || row.dsm_code || `DSM #${row.dsm_id}`}</div>
              <div>{formatValue(row.loading)}</div>
              <div>{formatValue(row.objectif)}</div>
              <div>{formatPct(row.progression)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

function Metric({ label, value, raw = false }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{raw ? value : formatValue(value)}</div>
    </div>
  );
}

export default LoadingSummaryCard;