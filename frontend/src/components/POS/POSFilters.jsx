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
      className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <label className="section-label" htmlFor="pos-filter-search">Recherche</label>
        <input
          id="pos-filter-search"
          type="text"
          placeholder="Code POS, nom, contact..."
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          className="input w-52"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="section-label" htmlFor="pos-filter-statut">Statut</label>
        <select
          id="pos-filter-statut"
          value={filters.statut}
          onChange={(e) => update('statut', e.target.value)}
          className="select w-40"
        >
          <option value="">Tous</option>
          {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="section-label" htmlFor="pos-filter-type">Type</label>
        <select
          id="pos-filter-type"
          value={filters.type}
          onChange={(e) => update('type', e.target.value)}
          className="select w-36"
        >
          <option value="">Tous</option>
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="section-label" htmlFor="pos-filter-partenaire">Partenaire</label>
        <select
          id="pos-filter-partenaire"
          value={filters.partenaire_id}
          onChange={(e) => update('partenaire_id', e.target.value)}
          className="select w-44"
        >
          <option value="">Tous</option>
          {safePartenaires.map((p) => {
            const label = p?.nom || p?.name || p?.code_partenaire || p?.code || `Partenaire #${p?.id ?? ''}`;
            return <option key={p.id} value={p.id}>{label}</option>;
          })}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="section-label" htmlFor="pos-filter-dsm">DSM</label>
        <select
          id="pos-filter-dsm"
          value={filters.dsm_id}
          onChange={(e) => update('dsm_id', e.target.value)}
          className="select w-44"
        >
          <option value="">Tous</option>
          {safeDsms.map((d) => {
            const label = d?.nom_complet || d?.full_name || d?.nom || d?.name || `DSM #${d?.id ?? ''}`;
            return <option key={d.id} value={d.id}>{label}</option>;
          })}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="section-label" htmlFor="pos-filter-zone">Micro-zone</label>
        <input
          id="pos-filter-zone"
          type="text"
          value={filters.region}
          onChange={(e) => update('region', e.target.value)}
          className="input w-32"
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-sm"
      >
        Filtrer
      </button>
    </form>
  );
}
