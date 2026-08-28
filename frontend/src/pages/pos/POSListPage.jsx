import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import posService from '../../services/posService';
import partenaireService from '../../services/partenaireService';
import dsmService from '../../services/dsmService';
import POSFilters from '../../components/POS/POSFilters';
import POSTable from '../../components/POS/POSTable';
import POSMap from '../../components/POS/POSMap';
import ExportButtons from '../../components/Common/ExportButtons/ExportButtons';
import PageHeader from '../../components/Common/PageHeader/PageHeader';
import Button from '../../components/Common/Button/Button';
import EmptyState from '../../components/Common/EmptyState/EmptyState';
import ErrorState from '../../components/Common/ErrorState/ErrorState';
import Pagination from '../../components/Common/Pagination/Pagination';

/** Colonnes d'export POS — alignées sur le tableau (POSTable). */
const EXPORT_COLUMNS = [
  { label: 'Code POS', value: 'code_pos' },
  { label: 'Nom', value: 'nom' },
  { label: 'Type', value: 'type_pos' },
  { label: 'Partenaire', value: 'partenaire.nom' },
  { label: 'DSM', value: 'dsm.nom_complet' },
  { label: 'Adresse / Zone', value: 'zone' },
  { label: 'Latitude GPS', value: 'latitude' },
  { label: 'Longitude GPS', value: 'longitude' },
  { label: 'Statut', value: 'statut' },
  { label: 'Linkage', value: 'linkage_status' },
  { label: 'Loading', value: 'loading' },
  { label: 'Sell-out', value: 'sell_out' },
  { label: 'Expiration', value: 'date_expiration' },
];

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
      .getEnriched(params)
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
      <PageHeader
        title="Liste des POS"
        subtitle="Parc de points de vente du partenaire actif — carte, filtres et suivi."
        actions={
          <Button variant="primary" onClick={() => navigate('/pos/new')}>
            + Nouveau POS
          </Button>
        }
      />

      {/* Onglets de catégories v3.4 : Tous | Créés | Reconduits | Liés */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
        {categoryCounts.map((cat) => (
          <button
            key={cat.id}
            type="button"
            aria-pressed={activeCategory === cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              setSelectedPOS(null);
            }}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeCategory === cat.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-white hover:text-slate-900'
            }`}
          >
            {cat.label}
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                activeCategory === cat.id ? 'bg-white/20' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      <POSFilters partenaires={partenaires} dsms={dsms} onFilter={setFilters} />

      {status === 'error' && (
        <ErrorState
          title="Erreur de chargement"
          message={error}
          onRetry={() => fetchPOS(pagination.page)}
        />
      )}

      {/* Layout responsive : carte au-dessus, tableau en dessous */}
      <div className="space-y-6">
        <div className="h-[420px] lg:h-[520px]">
          <POSMap pos={normalizedRows} selectedId={selectedPOS?.id} onSelect={handlePOSSelect} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Résultats</h2>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-gray-500">{rows.length} POS affiché(s)</span>
            <ExportButtons
              rows={normalizedRows}
              columns={EXPORT_COLUMNS}
              fileName="pos"
              title="Points de vente"
              disabled={status === 'loading'}
            />
          </div>
        </div>

        {status === 'empty' ? (
          <EmptyState
            title="Aucun POS trouvé"
            message="Aucun POS ne correspond à ces critères. Ajustez les filtres ou créez un nouveau point de vente."
            actionLabel="+ Nouveau POS"
            onAction={() => navigate('/pos/new')}
          />
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

      <Pagination
        page={pagination.page}
        pageSize={PAGE_SIZE}
        total={pagination.total}
        onPageChange={fetchPOS}
      />
    </div>
  );
}