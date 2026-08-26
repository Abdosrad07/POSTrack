import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import usePartner from '../../hooks/usePartner';
import partenaireService from '../../services/partenaireService';
import dsmService from '../../services/dsmService';
import POSTable from '../../components/POS/POSTable';
import POSLinkageStatsCard from '../../components/POS/POSLinkageStatsCard';

const PAGE_SIZE = 20;

export default function PartnerPOSPage() {
  const navigate = useNavigate();
  const { partnerContextId } = usePartner();

  const [rows, setRows] = useState([]);
  const [dsms, setDsms] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ sort_by: 'date_creation', order: 'desc' });
  const [selectedPOS, setSelectedPOS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!partnerContextId) return;

    dsmService.getAll({ limit: 100 })
      .then((r) => {
        const data = r.data?.items ?? r.data?.data ?? r.data ?? [];
        setDsms(Array.isArray(data) ? data : []);
      })
      .catch(() => setDsms([]));
  }, [partnerContextId]);

  const fetchPOS = useCallback((page = 1) => {
    if (!partnerContextId) return;

    setLoading(true);
    setError(null);
    const params = Object.fromEntries(
      Object.entries({
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        ...filters,
        ...sort,
      }).filter(([, v]) => v !== '' && v != null)
    );
    
    partenaireService
      .getPOS(params)
      .then((res) => {
        const data = res.data?.items ?? res.data?.data ?? res.data?.results ?? res.data ?? [];
        const items = Array.isArray(data) ? data : [];
        setRows(items);
        setPagination({
          page: Number(res.data?.page) || page,
          pages: Math.ceil((Number(res.data?.total ?? items.length)) / PAGE_SIZE),
          total: Number(res.data?.total ?? items.length),
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.apiMessage || err?.message || 'Impossible de charger la liste des POS.');
        setLoading(false);
      });
  }, [partnerContextId, filters, sort]);

  useEffect(() => { fetchPOS(1); }, [fetchPOS]);

  const toggleSort = (field) => {
    setSort((s) => ({
      sort_by: field,
      order: s.sort_by === field && s.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePOSSelect = useCallback((pos) => setSelectedPOS(pos), []);

  const handleDSMFilter = (dsmId) => {
    setFilters(prev => ({
      ...prev,
      dsm_id: dsmId || undefined
    }));
  };

  if (!partnerContextId) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Sélectionnez un partenaire pour afficher les POS.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">POS du Partenaire</h1>
          <p className="mt-1 text-sm text-gray-600">
            Tous les points de vente du partenaire avec leurs données métier.
          </p>
        </div>
      </div>

      {/* Statistiques de linkage POS - Niveau partenaire */}
      <POSLinkageStatsCard />

      {/* Filtre DSM */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtrer par DSM :</label>
          <select
            value={filters.dsm_id || ''}
            onChange={(e) => handleDSMFilter(e.target.value ? Number(e.target.value) : null)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Tous les DSM</option>
            {dsms.map((dsm) => (
              <option key={dsm.id} value={dsm.id}>
                {dsm.full_name || dsm.nom || `DSM #${dsm.id}`} ({dsm.matricule || 'N/A'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => fetchPOS(pagination.page)} className="font-medium underline">
            Réessayer
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Résultats</h2>
        <span className="text-sm text-gray-500">{rows.length} POS affiché(s) sur {pagination.total} au total</span>
      </div>

      {rows.length === 0 && !loading ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
          Aucun POS ne correspond à ces critères.
        </div>
      ) : (
        <POSTable
          rows={rows}
          loading={loading}
          sort={sort}
          onSort={toggleSort}
          onSelect={handlePOSSelect}
          selectedId={selectedPOS?.id}
        />
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{pagination.total} POS au total</span>
          <div className="flex gap-1">
            <button 
              disabled={pagination.page <= 1} 
              onClick={() => fetchPOS(pagination.page - 1)} 
              className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-40"
            >
              Précédent
            </button>
            <span className="px-3 py-1">{pagination.page} / {pagination.pages}</span>
            <button 
              disabled={pagination.page >= pagination.pages} 
              onClick={() => fetchPOS(pagination.page + 1)} 
              className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}