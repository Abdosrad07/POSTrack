import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import posService from '../../services/posService';
import partenaireService from '../../services/partenaireService';
import dsmService from '../../services/dsmService';
import POSFilters from '../../components/POS/POSFilters';
import POSTable from '../../components/POS/POSTable';
import POSMap from '../../components/POS/POSMap';

const PAGE_SIZE = 20;

/** Catégories de POS (spécification v3.4) : Tous | Créés | Reconduits | Liés */
const POS_CATEGORIES = [
  { id: 'all', label: 'Tous', type: null },
  { id: 'nouveau', label: 'Créés', type: 'NOUVEAU' },
  { id: 'reconduit', label: 'Reconduits', type: 'RECONDUIT' },
  { id: 'lie', label: 'Liés', type: 'LIÉ' },
];

export default function POSListPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [partenaires, setPartenaires] = useState([]);
  const [dsms, setDsms] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ sort_by: 'date_creation', order: 'desc' });
  const [selectedPOS, setSelectedPOS] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // États d'interface exigés par le document de référence : loading/success/empty/error
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    partenaireService.getAll({ limit: 100 })
      .then((r) => {
        const data = r.data?.items ?? r.data?.data ?? r.data ?? [];
        setPartenaires(Array.isArray(data) ? data : []);
      })
      .catch(() => setPartenaires([]));

    dsmService.getAll({ limit: 100 })
      .then((r) => {
        const data = r.data?.items ?? r.data?.data ?? r.data ?? [];
        setDsms(Array.isArray(data) ? data : []);
      })
      .catch(() => setDsms([]));
  }, []);

  const fetchPOS = useCallback((page = 1) => {
    setStatus('loading');
    setError(null);
    const params = Object.fromEntries(
      Object.entries({
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        ...filters,
        ...sort,
        ...(activeCategory !== 'all'
          ? { type_pos: POS_CATEGORIES.find((c) => c.id === activeCategory)?.type }
          : {}),
      }).filter(([, v]) => v !== '' && v != null)
    );
    posService
      .getAll(params)
      .then((res) => {
        const data = res.data?.items ?? res.data?.data ?? res.data?.results ?? res.data ?? [];
        const items = Array.isArray(data) ? data : [];
        setRows(items);
        setPagination({
          page: Number(res.data?.page) || page,
          pages: Number(res.data?.pages) || 1,
          total: Number(res.data?.total ?? items.length),
        });
        setStatus(items.length === 0 ? 'empty' : 'success');
      })
      .catch((err) => {
        setError(err?.apiMessage || err?.message || 'Impossible de charger la liste des POS.');
        setStatus('error');
      });
  }, [filters, sort, activeCategory]);

  useEffect(() => { fetchPOS(1); }, [fetchPOS]);

  const toggleSort = (field) => {
    setSort((s) => ({
      sort_by: field,
      order: s.sort_by === field && s.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  /** Compteurs par catégorie pour les onglets (calculés sur la page courante). */
  const categoryCounts = useMemo(
    () =>
      POS_CATEGORIES.map((cat) => ({
        ...cat,
        count: cat.type === null
          ? rows.length
          : rows.filter((r) => (r.type_pos || r.type) === cat.type).length,
      })),
    [rows]
  );

  const handlePOSSelect = useCallback((pos) => setSelectedPOS(pos), []);

  const normalizedRows = useMemo(
    () =>
      rows.map((pos) => ({
        ...pos,
        latitude: pos.latitude ?? pos.lat ?? pos.coordonnees?.latitude ?? null,
        longitude: pos.longitude ?? pos.lng ?? pos.coordonnees?.longitude ?? null,
      })),
    [rows]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Liste des POS</h1>
        <button
          onClick={() => navigate('/pos/new')}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nouveau POS
        </button>
      </div>

      {/* Onglets de catégories v3.4 : Tous | Créés | Reconduits | Liés */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
        {categoryCounts.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setActiveCategory(cat.id);
              setSelectedPOS(null);
            }}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {cat.label}
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                activeCategory === cat.id ? 'bg-white/20' : 'bg-gray-200'
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      <POSFilters partenaires={partenaires} dsms={dsms} onFilter={setFilters} />

      {status === 'error' && (
        <div className="flex items-center justify-between rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => fetchPOS(pagination.page)} className="font-medium underline">
            Réessayer
          </button>
        </div>
      )}

      {/* Layout responsive : carte au-dessus, tableau en dessous */}
      <div className="space-y-6">
        <div className="h-[420px] lg:h-[520px]">
          <POSMap pos={normalizedRows} selectedId={selectedPOS?.id} onSelect={handlePOSSelect} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Liste des POS</h2>
          <span className="text-sm text-gray-500">{rows.length} POS affiché(s)</span>
        </div>

        {status === 'empty' ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
            Aucun POS ne correspond à ces critères.
          </div>
        ) : (
          <POSTable
            rows={rows}
            loading={status === 'loading'}
            sort={sort}
            onSort={toggleSort}
            onSelect={handlePOSSelect}
            selectedId={selectedPOS?.id}
          />
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={fetchPOS} />
    </div>
  );
}

function Pagination({ pagination, onPageChange }) {
  const { page, pages, total } = pagination;
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-between text-sm text-gray-500">
      <span>{total} POS au total</span>
      <div className="flex gap-1">
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-40">
          Précédent
        </button>
        <span className="px-3 py-1">{page} / {pages}</span>
        <button disabled={page >= pages} onClick={() => onPageChange(page + 1)} className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-40">
          Suivant
        </button>
      </div>
    </div>
  );
}