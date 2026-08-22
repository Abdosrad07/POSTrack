import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/Common/PageHeader/PageHeader';
import EmptyState from '../../components/Common/EmptyState/EmptyState';
import ErrorState from '../../components/Common/ErrorState/ErrorState';
import LoadingSpinner from '../../components/Common/LoadingSpinner/LoadingSpinner';
import api from '../../services/api';

const RequetesListPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/requests', { params: { limit: 100 } });
      setItems(response.data?.items ?? response.data?.data ?? []);
    } catch (err) {
      setError(err?.apiMessage || err?.message || 'Impossible de charger les requêtes.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const rows = useMemo(() => items, [items]);

  return (
    <div>
      <PageHeader
        title="Requêtes"
        subtitle="Demandes et incidents terrain du partenaire actif."
        breadcrumbs={['Espace partenaire', 'Requêtes']}
      />

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 shadow-sm">
          <LoadingSpinner label="Chargement des requêtes..." />
        </div>
      ) : error ? (
        <ErrorState title="Erreur de chargement" message={error} onRetry={fetchRequests} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Aucune requête"
          message="Aucune requête n'a encore été enregistrée pour ce partenaire."
          icon="🧭"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Titre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Priorité</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Entités</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.titre}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.type_requete ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.priorite ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.statut ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {(item.entites ?? []).map((entity) => `${entity.entity_type} #${entity.entity_id}`).join(', ') || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequetesListPage;