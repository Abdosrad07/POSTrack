import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePartner from '../../hooks/usePartner';
import dsmService from '../../services/dsmService';
import partenaireService from '../../services/partenaireService';
import POSTable from '../../components/POS/POSTable';
import POSLinkageStatsCard from '../../components/POS/POSLinkageStatsCard';
import DSMIdentityCard from '../../components/DSM/DSMIdentityCard';

const PAGE_SIZE = 20;

export default function DSMPOSPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { partnerContextId } = usePartner();

  const [rows, setRows] = useState([]);
  const [dsmInfo, setDsmInfo] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ sort_by: 'date_creation', order: 'desc' });
  const [selectedPOS, setSelectedPOS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || !partnerContextId) return;

    // Charger les informations du DSM
    dsmService.getById(id)
      .then((res) => {
        setDsmInfo(res.data);
      })
      .catch((err) => {
        setError(err?.apiMessage || err?.message || 'Impossible de charger les informations du DSM.');
        setLoading(false);
      });
  }, [id, partnerContextId]);

  const fetchPOS = useCallback((page = 1) => {
    if (!id || !partnerContextId) return;

    setLoading(true);
    setError(null);
    const params = Object.fromEntries(
      Object.entries({
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        dsm_id: Number(id), // Filtrer par DSM
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
  }, [id, partnerContextId, filters, sort]);

  useEffect(() => { fetchPOS(1); }, [fetchPOS]);

  const toggleSort = (field) => {
    setSort((s) => ({
      sort_by: field,
      order: s.sort_by === field && s.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePOSSelect = useCallback((pos) => setSelectedPOS(pos), []);

  if (!partnerContextId) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Sélectionnez un partenaire pour afficher les POS.
      </div>
    );
  }

  if (!id) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
        ID DSM manquant.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">POS du DSM</h1>
          <p className="mt-1 text-sm text-gray-600">
            Points de vente spécifiques à ce DSM avec leurs données métier.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/dsm')}
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Retour aux DSM
        </button>
      </div>

      {/* Informations du DSM */}
      {dsmInfo && (
        <DSMIdentityCard dsm={dsmInfo} loading={false} />
      )}

      {/* Statistiques de linkage POS - Niveau DSM */}
      <POSLinkageStatsCard dsmId={Number(id)} />

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
          Aucun POS ne correspond à ce DSM.
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