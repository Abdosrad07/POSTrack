import { useState } from 'react';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    'Ouvert': 'bg-green-100 text-green-800',
    'Fermé': 'bg-gray-100 text-gray-800',
    'En cours': 'bg-blue-100 text-blue-800',
    'En attente': 'bg-amber-100 text-amber-800'
  };

  const defaultStyle = 'bg-gray-100 text-gray-800';
  const style = statusStyles[status] || defaultStyle;

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const priorityStyles = {
    'URGENTE': 'bg-red-100 text-red-800',
    'HAUTE': 'bg-orange-100 text-orange-800',
    'NORMALE': 'bg-blue-100 text-blue-800',
    'BASSE': 'bg-gray-100 text-gray-800'
  };

  const defaultStyle = 'bg-gray-100 text-gray-800';
  const style = priorityStyles[priority] || defaultStyle;

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${style}`}>
      {priority}
    </span>
  );
};

const ProgressionBar = ({ value }) => {
  const percentage = Math.min(100, Math.max(0, value));
  const color = percentage >= 75 ? 'bg-green-500' : percentage >= 50 ? 'bg-blue-500' : percentage >= 25 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5">
      <div
        className={`${color} h-1.5 rounded-full transition-all`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

const RequestRow = ({ request, onClick }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div
      onClick={() => onClick && onClick(request)}
      className="cursor-pointer border-b border-gray-100 py-3 hover:bg-gray-50 transition-colors last:border-0"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={request.statut} />
            {request.priorite && <PriorityBadge priority={request.priorite} />}
          </div>
          <h4 className="text-sm font-medium text-gray-900 truncate">{request.cas_anomalie}</h4>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span>Demandeur: {request.demandeur || '—'}</span>
            <span>•</span>
            <span>Ouvert: {formatDate(request.date_ouverture)}</span>
            {request.delai && <span>•</span>}
            {request.delai && <span>Délai: {request.delai}j</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 min-w-[120px]">
          <div className="text-right">
            <div className="text-xs text-gray-500">Progression</div>
            <div className="text-sm font-semibold text-gray-900">{request.progression.toFixed(1)}%</div>
          </div>
          <ProgressionBar value={request.progression} />
        </div>
      </div>
      
      {request.nombre_demande > 0 && (
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
          <span>Demandé: {request.nombre_demande}</span>
          <span>Effectué: {request.nombre_effectue}</span>
          {request.nombre_rejete > 0 && <span>Rejeté: {request.nombre_rejete}</span>}
        </div>
      )}
    </div>
  );
};

export default function DSMRequestsCard({ requests, loading, onRequestClick }) {
  const [filter, setFilter] = useState('all');

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-amber-50 to-white px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Requêtes</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">Suivi des demandes</h2>
        </div>
        <div className="px-5 py-8 text-center text-gray-500">
          Aucune requête pour ce DSM
        </div>
      </div>
    );
  }

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    if (filter === 'open') return req.statut === 'Ouvert';
    if (filter === 'closed') return req.statut === 'Fermé';
    return true;
  });

  const openCount = requests.filter(r => r.statut === 'Ouvert').length;
  const closedCount = requests.filter(r => r.statut === 'Fermé').length;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-r from-amber-50 to-white px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Requêtes</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Suivi des demandes</h2>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">{requests.length} total</span>
            <span className="text-green-600">{openCount} ouvertes</span>
            <span className="text-gray-400">{closedCount} fermées</span>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 px-5 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === 'open' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Ouvertes
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === 'closed' 
                ? 'bg-gray-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Fermées
          </button>
        </div>
      </div>

      <div className="px-5 py-2 max-h-96 overflow-y-auto">
        {filteredRequests.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            Aucune requête ne correspond à ce filtre
          </div>
        ) : (
          filteredRequests.map((request) => (
            <RequestRow
              key={request.id}
              request={request}
              onClick={onRequestClick}
            />
          ))
        )}
      </div>
    </div>
  );
}