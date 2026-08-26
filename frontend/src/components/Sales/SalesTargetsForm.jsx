import React, { useMemo, useState } from 'react';

const EMPTY = {
  month: '',
  creation_target: '',
  redeployment_target: '',
  sell_out_target: '',
  loading_target: '',
  revenue_target: '',
  creation_stock_initial: '',
  redeployment_stock_initial: '',
};

const toIntOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
};

export default function SalesTargetsForm({ partnerName, initialValues = EMPTY, onSubmit, submitting = false }) {
  const [form, setForm] = useState({ ...EMPTY, ...initialValues });
  const [error, setError] = useState('');

  const monthLabel = useMemo(() => (form.month ? new Date(`${form.month}T00:00:00`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '—'), [form.month]);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.month) {
      setError('Le mois est obligatoire.');
      return;
    }
    await onSubmit({
      month: form.month,
      creation_target: toIntOrNull(form.creation_target),
      redeployment_target: toIntOrNull(form.redeployment_target),
      sell_out_target: toIntOrNull(form.sell_out_target),
      loading_target: toIntOrNull(form.loading_target),
      revenue_target: toIntOrNull(form.revenue_target),
      creation_stock_initial: toIntOrNull(form.creation_stock_initial),
      redeployment_stock_initial: toIntOrNull(form.redeployment_stock_initial),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Objectifs de ventes</h2>
        <p className="mt-1 text-sm text-slate-500">Définition mensuelle des objectifs pour {partnerName || 'le partenaire sélectionné'}.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Mois</span>
          <input type="month" value={form.month} onChange={update('month')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Mois courant : <span className="font-medium text-slate-900">{monthLabel}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ['creation_target', 'Objectif création'],
          ['redeployment_target', 'Objectif redéploiement'],
          ['sell_out_target', 'Objectif sell-out'],
          ['loading_target', 'Objectif loading'],
          ['revenue_target', 'Objectif global de vente (FCFA)'],
          ['creation_stock_initial', 'Stock initial création'],
          ['redeployment_stock_initial', 'Stock initial redéploiement'],
        ].map(([key, label]) => (
          <label key={key} className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">{label}</span>
            <input type="number" min="0" step="1" value={form[key]} onChange={update(key)} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Non renseigné" />
          </label>
        ))}
      </div>

      {error ? <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="flex justify-end gap-2">
        <button type="submit" disabled={submitting} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          {submitting ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}