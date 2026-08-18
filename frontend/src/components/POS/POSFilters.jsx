import { useState } from 'react';

const STATUTS = ['ACTIF', 'SUSPENDU', 'RENOUVELLEMENT', 'CLOTURE'];
const TYPES = ['NOUVEAU', 'RECONDUIT'];

export default function POSFilters({ partenaires = [], dsms = [], onFilter }) {
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
          {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
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
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
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
          {partenaires.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
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
          {dsms.map((d) => <option key={d.id} value={d.id}>{d.nom_complet}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Région</label>
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
