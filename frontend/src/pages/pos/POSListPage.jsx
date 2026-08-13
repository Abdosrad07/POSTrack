import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import posService from '../../services/posService';
import partenaireService from '../../services/partenaireService';
import dsmService from '../../services/dsmService';
import POSFilters from '../../components/POS/POSFilters';
import POSTable from '../../components/POS/POSTable';

const PAGE_SIZE = 20;

export default function POSListPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [partenaires, setPartenaires] = useState([]);
  const [dsms, setDsms] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ sort_by: 'date_creation', order: 'desc' });

  // États d'interface exigés par le document de référence : loading/success/empty/error
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    partenaireService.getAll({ limit: 100 }).then((r) => setPartenaires(r.data.data ?? []));
    dsmService.getAll({ limit: 100 }).then((r) => setDsms(r.data.data ?? []));
  }, []);

  const fetchPOS = useCallback((page = 1) => {
    setStatus('loading');
    posService
      .getAll({ page, limit: PAGE_SIZE, ...filters, ...sort })
      .then((res) => {
        const data = res.data.data ?? [];
        setRows(data);
        setPagination(res.data.pagination ?? { page: 1, pages: 1, total: 0 });
        setStatus(data.length === 0 ? 'empty' : 'success');
      })
      .catch(() => {
        setError("Impossible de charger la liste des POS.");
        setStatus('error');
      });
  }, [filters, sort]);

  useEffect(() => { fetchPOS(1); }, [fetchPOS]);

  const toggleSort = (field) => {
    setSort((s) => ({
      sort_by: field,
      order: s.sort_by === field && s.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Liste des POS</h1>
        <button
          onClick={() => navigate('/pos/nouveau')}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nouveau POS
        </button>
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

      {status === 'empty' ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
          Aucun POS ne correspond à ces critères.
        </div>
      ) : (
        <POSTable rows={rows} loading={status === 'loading'} sort={sort} onSort={toggleSort} />
      )}

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