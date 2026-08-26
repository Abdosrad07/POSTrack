import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/Common/PageHeader/PageHeader';
import EmptyState from '../../components/Common/EmptyState/EmptyState';
import ErrorState from '../../components/Common/ErrorState/ErrorState';
import LoadingSpinner from '../../components/Common/LoadingSpinner/LoadingSpinner';
import requeteService from '../../services/requeteService';
import { ENTITES_EN_CHARGE } from '../../utils/constants';

const TYPE_LABELS = {
  AJOUT: 'Ajout',
  RECONDUCTION: 'Reconduction',
  DELINKAGE: 'Déliage',
  BASCULEMENT: 'Basculement',
  AUTRE: 'Autres',
};

const dayOf = (value) => (value ? String(value).slice(0, 10) : '');

/**
 * Tableau de suivi des requêtes (v3.4 §2.4/§6).
 * Source : GET /requests (requêtes individuelles) afin d'exposer
 * la colonne « Entité en charge ».
 */
const RequetesListPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [dsms, setDsms] = useState([]);
  const [filters, setFilters] = useState({
    type_requete: '',
    entite_en_charge: '',
    dsm_id: '',
    date_creation_from: '',
    date_creation_to: '',
    date_fin_from: '',
    date_fin_to: '',
  });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 500 };
      if (filters.dsm_id) {
        params.dsm_id = filters.dsm_id;
      }
      const response = await requeteService.list(params);
      setItems(response.data?.items ?? []);
    } catch (err) {
      setError(err?.apiMessage || err?.message || 'Impossible de charger les requêtes.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters.dsm_id]);

  const fetchDSMs = useCallback(async () => {
    try {
      const response = await dsmService.list();
      setDsms(response.data || []);
    } catch (err) {
      console.error('Impossible de charger les DSM:', err);
      setDsms([]);
    }
  }, []);

  useEffect(() => {
    void fetchRequests();
    void fetchDSMs();
  }, [fetchRequests, fetchDSMs]);

  const rows = useMemo(() => items.filter((item) => {
    if (filters.type_requete && item.type_requete !== filters.type_requete) return false;
    if (filters.entite_en_charge
      && (item.entite_en_charge || '') !== filters.entite_en_charge) return false;
    if (filters.dsm_id && item.dsm_id != filters.dsm_id) return false;
    const created = dayOf(item.date_creation);
    if (filters.date_creation_from && created < filters.date_creation_from) return false;
    if (filters.date_creation_to && created > filters.date_creation_to) return false;
    const fin = dayOf(item.date_finalisation || item.closed_at);
    if (filters.date_fin_from && fin < filters.date_fin_from) return false;
    if (filters.date_fin_to && fin > filters.date_fin_to) return false;
    return true;
  }), [items, filters]);

  /** Entités présentes dans les données + presets constants. */
  const entiteOptions = useMemo(() => {
    const present = items
      .map((i) => i.entite_en_charge)
      .filter(Boolean)
      .filter((v) => !ENTITES_EN_CHARGE.includes(v));
    return [...ENTITES_EN_CHARGE, ...Array.from(new Set(present)).sort()];
  }, [items]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <div>
      <PageHeader
        title="Requêtes"
        subtitle="Suivi des demandes : ajout, reconduction, déliage, basculement."
        breadcrumbs={['Espace partenaire', 'Requêtes']}
      />
      {/* Filtres */}
      <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3 lg:grid-cols-6">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Type</span>
          <select className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={filters.type_requete}
            onChange={(e) => updateFilter('type_requete', e.target.value)}>
            <option value="">Tous</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">DSM</span>
          <select className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={filters.dsm_id}
            onChange={(e) => updateFilter('dsm_id', e.target.value)}>
            <option value="">Tous</option>
            {dsms.map((dsm) => (
              <option key={dsm.id} value={dsm.id}>{dsm.full_name || dsm.matricule || `DSM #${dsm.id}`}</option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Entité en charge</span>
          <select className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={filters.entite_en_charge}
            onChange={(e) => updateFilter('entite_en_charge', e.target.value)}>
            <option value="">Toutes</option>
            {entiteOptions.map((entite) => (
              <option key={entite} value={entite}>{entite}</option>
            ))}
          </select>
        </label>

        <label className="text-sm"><span className="mb-1 block font-medium text-slate-700">Créée du</span><input type="date" className="w-full rounded-lg border border-slate-300 px-3 py-2" value={filters.date_creation_from} onChange={(e) => updateFilter('date_creation_from', e.target.value)} /></label>
        <label className="text-sm"><span className="mb-1 block font-medium text-slate-700">Créée au</span><input type="date" className="w-full rounded-lg border border-slate-300 px-3 py-2" value={filters.date_creation_to} onChange={(e) => updateFilter('date_creation_to', e.target.value)} /></label>
        <label className="text-sm"><span className="mb-1 block font-medium text-slate-700">Fin du</span><input type="date" className="w-full rounded-lg border border-slate-300 px-3 py-2" value={filters.date_fin_from} onChange={(e) => updateFilter('date_fin_from', e.target.value)} /></label>
        <label className="text-sm"><span className="mb-1 block font-medium text-slate-700">Fin au</span><input type="date" className="w-full rounded-lg border border-slate-300 px-3 py-2" value={filters.date_fin_to} onChange={(e) => updateFilter('date_fin_to', e.target.value)} /></label>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 shadow-sm">
          <LoadingSpinner label="Chargement des requêtes..." />
        </div>
      ) : error ? (
        <ErrorState title="Erreur de chargement" message={error} onRetry={fetchRequests} />
      ) : rows.length === 0 ? (
        <EmptyState title="Aucune requête"
          message="Aucune requête n'a encore été enregistrée pour ce partenaire." icon="🧭" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date d'ouverture</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Demandeur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">DSM demandeur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Type de requête</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Entité en charge</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Délai d'attente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date de fin</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Cas / anomalie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {rows.map((item) => {
                  const created = dayOf(item.date_creation);
                  const fin = dayOf(item.date_finalisation || item.closed_at);
                  const statut = item.statut || (item.nombre_effectue + item.nombre_rejete >= item.nombre_demande && item.nombre_demande > 0 ? 'Terminée' : 'En cours');
                  const delaiAttente = item.delai_attente != null ? `${item.delai_attente} jour(s)` : '—';
                  
                  return (
                    <tr key={item.id} className={item.en_retard ? 'bg-amber-50' : ''}>
                      <td className="px-4 py-3 text-sm text-slate-600">{created}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.demandeur_name || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.dsm_name || '—'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          statut === 'Terminée' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {statut}
                        </span>
                        {item.en_retard && (
                          <span className="ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-red-100 text-red-800">
                            En retard
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{TYPE_LABELS[item.type_requete] ?? item.type_requete}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.entite_en_charge || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{delaiAttente}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{fin || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.titre || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequetesListPage;
