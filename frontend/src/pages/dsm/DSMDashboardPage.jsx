import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePartner from '../../hooks/usePartner';
import dsmService from '../../services/dsmService';

const StatCard = ({ label, value, subLabel }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
    <div className="mt-2 text-2xl font-bold text-slate-900">{value ?? '—'}</div>
    {subLabel && <div className="mt-1 text-xs text-slate-600">{subLabel}</div>}
  </div>
);

const DSMRow = ({ dsm, onClick }) => (
  <div 
    onClick={() => onClick(dsm.id)}
    className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-slate-900">
          {dsm.full_name || dsm.nom || `DSM #${dsm.id}`}
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Code: {dsm.matricule || 'N/A'} • Zone: {dsm.zone || dsm.micro_zone || 'Non renseigné'}
        </p>
      </div>
      <div className="ml-4 flex items-center">
        <span className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
          Voir détails →
        </span>
      </div>
    </div>
    
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      <div>
        <div className="text-xs text-slate-500">POS créés</div>
        <div className="text-sm font-semibold text-slate-900">{dsm.nb_pos_crees ?? 0}</div>
      </div>
      <div>
        <div className="text-xs text-slate-500">POS actifs</div>
        <div className="text-sm font-semibold text-slate-900">{dsm.nb_pos_actifs ?? 0}</div>
      </div>
      <div>
        <div className="text-xs text-slate-500">Loading</div>
        <div className="text-sm font-semibold text-slate-900">{dsm.loading ?? 0}</div>
      </div>
      <div>
        <div className="text-xs text-slate-500">Sell-out</div>
        <div className="text-sm font-semibold text-slate-900">{dsm.sell_out ?? 0}</div>
      </div>
      <div>
        <div className="text-xs text-slate-500">Recettes</div>
        <div className="text-sm font-semibold text-slate-900">{dsm.recettes ? `${dsm.recettes.toLocaleString()} FCFA` : '—'}</div>
      </div>
      <div>
        <div className="text-xs text-slate-500">Requêtes</div>
        <div className="text-sm font-semibold text-slate-900">{dsm.requetes ?? 0}</div>
      </div>
    </div>
    
    {dsm.progression !== null && (
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
          <span>Progression objectifs</span>
          <span>{dsm.progression.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(100, dsm.progression)}%` }}
          />
        </div>
      </div>
    )}
  </div>
);

export default function DSMDashboardPage() {
  const navigate = useNavigate();
  const { partnerContextId } = usePartner();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtres et tri
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nb_pos_crees');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await dsmService.getDashboard();
        
        if (!active) return;
        setDashboardData(response.data);
      } catch (e) {
        if (!active) return;
        setError(e?.apiMessage || e?.message || 'Impossible de charger le dashboard DSM.');
        setDashboardData(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadDashboard();
    return () => { active = false; };
  }, [partnerContextId]);

  const handleDSMClick = (dsmId) => {
    navigate(`/dsm/${dsmId}`);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedDSMs = () => {
    if (!dashboardData?.dsms) return [];

    let filtered = [...dashboardData.dsms];

    // Filtrage par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(dsm =>
        (dsm.full_name || '').toLowerCase().includes(term) ||
        (dsm.matricule || '').toLowerCase().includes(term) ||
        (dsm.zone || '').toLowerCase().includes(term)
      );
    }

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'full_name':
          comparison = (a.full_name || '').localeCompare(b.full_name || '');
          break;
        case 'matricule':
          comparison = (a.matricule || '').localeCompare(b.matricule || '');
          break;
        case 'nb_pos_crees':
          comparison = (a.nb_pos_crees || 0) - (b.nb_pos_crees || 0);
          break;
        case 'nb_pos_actifs':
          comparison = (a.nb_pos_actifs || 0) - (b.nb_pos_actifs || 0);
          break;
        case 'loading':
          comparison = (a.loading || 0) - (b.loading || 0);
          break;
        case 'sell_out':
          comparison = (a.sell_out || 0) - (b.sell_out || 0);
          break;
        case 'recettes':
          comparison = (a.recettes || 0) - (b.recettes || 0);
          break;
        case 'requetes':
          comparison = (a.requetes || 0) - (b.requetes || 0);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Chargement du dashboard DSM...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
        <p>{error}</p>
      </div>
    );
  }

  const filteredDSMs = filteredAndSortedDSMs();
  const globalStats = dashboardData?.global_stats || {};

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard DSM</h1>
          <p className="mt-1 text-sm text-slate-600">
            Vue globale des DSM du partenaire - {dashboardData?.total_dsm || 0} DSM(s)
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/dsm/new')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          + Nouveau DSM
        </button>
      </div>

      {/* Indicateurs globaux */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard 
          label="Total POS créés" 
          value={globalStats.total_pos_crees} 
        />
        <StatCard 
          label="Total POS actifs" 
          value={globalStats.total_pos_actifs} 
        />
        <StatCard 
          label="Total Loading" 
          value={globalStats.total_loading} 
        />
        <StatCard 
          label="Total Sell-out" 
          value={globalStats.total_sell_out} 
        />
        <StatCard 
          label="Total Recettes" 
          value={globalStats.total_recettes ? `${globalStats.total_recettes.toLocaleString()} FCFA` : '—'} 
        />
        <StatCard 
          label="Total Requêtes" 
          value={globalStats.total_requetes} 
        />
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, code ou zone..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Trier par:</label>
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="nb_pos_crees">POS créés</option>
            <option value="nb_pos_actifs">POS actifs</option>
            <option value="loading">Loading</option>
            <option value="sell_out">Sell-out</option>
            <option value="recettes">Recettes</option>
            <option value="requetes">Requêtes</option>
            <option value="full_name">Nom</option>
            <option value="matricule">Code</option>
          </select>
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Liste des DSM */}
      {filteredDSMs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">
            {searchTerm ? 'Aucun DSM ne correspond à votre recherche.' : 'Aucun DSM disponible pour ce partenaire.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDSMs.map((dsm) => (
            <DSMRow 
              key={dsm.id} 
              dsm={dsm} 
              onClick={handleDSMClick} 
            />
          ))}
        </div>
      )}
    </div>
  );
}