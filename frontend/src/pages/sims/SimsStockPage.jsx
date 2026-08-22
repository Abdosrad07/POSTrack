import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/Common/PageHeader/PageHeader';
import EmptyState from '../../components/Common/EmptyState/EmptyState';
import ErrorState from '../../components/Common/ErrorState/ErrorState';
import LoadingSpinner from '../../components/Common/LoadingSpinner/LoadingSpinner';
import api from '../../services/api';

const SimsStockPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);

  const fetchSims = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/sim', { params: { limit: 100 } });
      setItems(response.data?.items ?? response.data?.data ?? []);
    } catch (err) {
      setError(err?.apiMessage || err?.message || 'Impossible de charger le stock SIM.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSims();
  }, [fetchSims]);

  const rows = useMemo(() => items, [items]);

  return (
    <div>
      <PageHeader
        title="Stock SIM"
        subtitle="Suivi des cartes SIM du partenaire actif."
        breadcrumbs={['Espace partenaire', 'Stock SIM']}
      />

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 shadow-sm">
          <LoadingSpinner label="Chargement du stock SIM..." />
        </div>
      ) : error ? (
        <ErrorState title="Erreur de chargement" message={error} onRetry={fetchSims} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Aucune SIM"
          message="Aucune SIM n'est encore enregistrée pour ce partenaire."
          icon="📶"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">ICCID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">POS</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Commentaire</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.iccid}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.pos?.code_pos ?? item.pos_id ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.status ?? item.statut ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.commentaire ?? '—'}</td>
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

export default SimsStockPage;