import { useState } from 'react';

const STATUTS = [
  { value: 'ACTIF', label: 'Actif' },
  { value: 'SUSPENDU', label: 'Suspendu' },
  { value: 'RENOUVELLEMENT', label: 'Renouvellement' },
  { value: 'CLOTURE', label: 'Clôturé' },
];
const TYPES = [
  { value: 'NOUVEAU', label: 'Créé' },
  { value: 'RECONDUIT', label: 'Reconduit' },
];

export default function POSFilters({ partenaires = [], dsms = [], onFilter }) {
  const safePartenaires = Array.isArray(partenaires) ? partenaires : [];
  const safeDsms = Array.isArray(dsms) ? dsms : [];
  const [filters, setFilters] = useState({
    search: '',
    statut: '',
    type: '',
    partenaire_id: '',
    dsm_id: '',
    region: '',
  });

  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const submit = (e) => {
    e.preventDefault();
    onFilter?.(filters);
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Recherche</label>
        <input
          type="text"
          placeholder="Code POS, nom, contact..."
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          className="w-52 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Statut</label>
        <select
          value={filters.statut}
          onChange={(e) => update('statut', e.target.value)}
          className="w-40 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">Tous</option>
          {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Type</label>
        <select
          value={filters.type}
          onChange={(e) => update('type', e.target.value)}
          className="w-36 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">Tous</option>
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Partenaire</label>
        <select
          value={filters.partenaire_id}
          onChange={(e) => update('partenaire_id', e.target.value)}
          className="w-44 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">Tous</option>
          {safePartenaires.map((p) => {
            const label = p?.nom || p?.name || p?.code_partenaire || p?.code || `Partenaire #${p?.id ?? ''}`;
            return <option key={p.id} value={p.id}>{label}</option>;
          })}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">DSM</label>
        <select
          value={filters.dsm_id}
          onChange={(e) => update('dsm_id', e.target.value)}
          className="w-44 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">Tous</option>
          {safeDsms.map((d) => {
            const label = d?.nom_complet || d?.full_name || d?.nom || d?.name || `DSM #${d?.id ?? ''}`;
            return <option key={d.id} value={d.id}>{label}</option>;
          })}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Micro-zone</label>
        <input
          type="text"
          value={filters.region}
          onChange={(e) => update('region', e.target.value)}
          className="w-32 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>

      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        Filtrer
      </button>
    </form>
  );
}
