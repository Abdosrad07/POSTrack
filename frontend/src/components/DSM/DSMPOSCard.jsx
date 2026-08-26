import { useState } from 'react';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    'ACTIF': 'bg-green-100 text-green-800',
    'SUSPENDU': 'bg-amber-100 text-amber-800',
    'FERME': 'bg-red-100 text-red-800'
  };

  const defaultStyle = 'bg-gray-100 text-gray-800';
  const style = statusStyles[status] || defaultStyle;

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const typeStyles = {
    'NOUVEAU': 'bg-violet-100 text-violet-800',
    'RECONDUIT': 'bg-cyan-100 text-cyan-800'
  };

  const defaultStyle = 'bg-gray-100 text-gray-800';
  const style = typeStyles[type] || defaultStyle;

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${style}`}>
      {type}
    </span>
  );
};

const LinkageBadge = ({ linkageStatus }) => {
  const linkageStyles = {
    'LINKED': 'bg-emerald-100 text-emerald-800',
    'UNLINKED': 'bg-amber-100 text-amber-800'
  };

  const defaultStyle = 'bg-gray-100 text-gray-800';
  const style = linkageStyles[linkageStatus] || defaultStyle;

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${style}`}>
      {linkageStatus === 'LINKED' ? 'Linké' : 'Délinké'}
    </span>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const POSRow = ({ pos, onClick }) => {
  return (
    <div
      onClick={() => onClick && onClick(pos)}
      className="cursor-pointer border-b border-gray-100 py-3 hover:bg-gray-50 transition-colors last:border-0"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={pos.status} />
            <TypeBadge type={pos.type_pos} />
            <LinkageBadge linkageStatus={pos.linkage_status} />
          </div>
          <h4 className="text-sm font-medium text-gray-900">{pos.code_pos}</h4>
          <p className="text-xs text-gray-500 truncate">{pos.name || 'Sans nom'}</p>
          {pos.zone && (
            <div className="mt-1 text-xs text-gray-400">Zone: {pos.zone}</div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2 min-w-[100px]">
          <div className="text-right">
            <div className="text-xs text-gray-500">Loading</div>
            <div className="text-sm font-semibold text-gray-900">{pos.loading}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Sell-out</div>
            <div className="text-sm font-semibold text-gray-900">{pos.sell_out}</div>
          </div>
        </div>
      </div>
      
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-500">
        <div>
          <span className="text-gray-400">Création:</span> {formatDate(pos.date_creation)}
        </div>
        <div>
          <span className="text-gray-400">Expiration:</span> {formatDate(pos.date_expiration)}
        </div>
        <div>
          <span className="text-gray-400">Stock initial:</span> {pos.stock_initial}
        </div>
        <div>
          <span className="text-gray-400">Stock actuel:</span> {pos.stock_actuel}
        </div>
      </div>
      
      {pos.recettes > 0 && (
        <div className="mt-2 text-xs text-green-600 font-medium">
          Recettes: {pos.recettes.toLocaleString()} FCFA
        </div>
      )}
    </div>
  );
};

export default function DSMPOSCard({ posData, loading, onPOSClick }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_creation');

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!posData || posData.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">POS</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">Gestion des points de vente</h2>
        </div>
        <div className="px-5 py-8 text-center text-gray-500">
          Aucun POS pour ce DSM
        </div>
      </div>
    );
  }

  const filteredPOS = posData.filter(pos => {
    if (filter === 'all') return true;
    if (filter === 'actif') return pos.status === 'ACTIF';
    if (filter === 'suspendu') return pos.status === 'SUSPENDU';
    if (filter === 'ferme') return pos.status === 'FERME';
    if (filter === 'nouveau') return pos.type_pos === 'NOUVEAU';
    if (filter === 'reconduit') return pos.type_pos === 'RECONDUIT';
    return true;
  });

  const sortedPOS = [...filteredPOS].sort((a, b) => {
    switch (sortBy) {
      case 'date_creation':
        return new Date(b.date_creation || 0) - new Date(a.date_creation || 0);
      case 'date_expiration':
        return new Date(a.date_expiration || 0) - new Date(b.date_expiration || 0);
      case 'loading':
        return (b.loading || 0) - (a.loading || 0);
      case 'sell_out':
        return (b.sell_out || 0) - (a.sell_out || 0);
      case 'recettes':
        return (b.recettes || 0) - (a.recettes || 0);
      case 'code_pos':
        return (a.code_pos || '').localeCompare(b.code_pos || '');
      default:
        return 0;
    }
  });

  const stats = {
    total: posData.length,
    actifs: posData.filter(p => p.status === 'ACTIF').length,
    suspendus: posData.filter(p => p.status === 'SUSPENDU').length,
    fermes: posData.filter(p => p.status === 'FERME').length,
    nouveaux: posData.filter(p => p.type_pos === 'NOUVEAU').length,
    reconduits: posData.filter(p => p.type_pos === 'RECONDUIT').length,
    totalLoading: posData.reduce((sum, p) => sum + (p.loading || 0), 0),
    totalSellOut: posData.reduce((sum, p) => sum + (p.sell_out || 0), 0),
    totalRecettes: posData.reduce((sum, p) => sum + (p.recettes || 0), 0)
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">POS</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Gestion des points de vente</h2>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">{stats.actifs}</div>
              <div className="text-xs text-gray-500">Actifs</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-amber-600">{stats.suspendus}</div>
              <div className="text-xs text-gray-500">Suspendus</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et tri */}
      <div className="border-b border-gray-200 px-5 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('actif')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === 'actif' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Actifs
            </button>
            <button
              onClick={() => setFilter('nouveau')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === 'nouveau' 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Nouveaux
            </button>
            <button
              onClick={() => setFilter('reconduit')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === 'reconduit' 
                  ? 'bg-cyan-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Reconduits
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="date_creation">Date création</option>
              <option value="date_expiration">Date expiration</option>
              <option value="loading">Loading</option>
              <option value="sell_out">Sell-out</option>
              <option value="recettes">Recettes</option>
              <option value="code_pos">Code POS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200">
        <div className="text-center">
          <div className="text-xs text-gray-500">Loading total</div>
          <div className="text-sm font-semibold text-gray-900">{stats.totalLoading}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Sell-out total</div>
          <div className="text-sm font-semibold text-gray-900">{stats.totalSellOut}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Recettes totales</div>
          <div className="text-sm font-semibold text-gray-900">{stats.totalRecettes.toLocaleString()} FCFA</div>
        </div>
      </div>

      {/* Liste des POS */}
      <div className="px-5 py-2 max-h-[500px] overflow-y-auto">
        {sortedPOS.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            Aucun POS ne correspond à ce filtre
          </div>
        ) : (
          sortedPOS.map((pos) => (
            <POSRow
              key={pos.id}
              pos={pos}
              onClick={onPOSClick}
            />
          ))
        )}
      </div>
    </div>
  );
}