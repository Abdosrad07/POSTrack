import { useNavigate } from 'react-router-dom';
import StatusBadge from '../Common/StatusBadge';

const TYPE_LABELS = {
  NOUVEAU: 'Créé',
  RECONDUIT: 'Reconduit',
  'LIÉ': 'Lié',
  LIE: 'Lié',
};

export default function POSTable({ rows = [], loading = false, sort, onSort, onSelect, selectedId = null }) {
  const navigate = useNavigate();
  const safeRows = Array.isArray(rows) ? rows : [];

  const toggle = (field) => onSort?.(field);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <Th onClick={() => toggle('code_pos')}>Code POS</Th>
            <Th onClick={() => toggle('nom')}>Nom</Th>
            <Th>Type</Th>
            <Th>Partenaire</Th>
            <Th>DSM</Th>
            <Th>Coordonnées</Th>
            <Th onClick={() => toggle('statut')}>Statut</Th>
            <Th>Linkage</Th>
            <Th onClick={() => toggle('date_expiration')}>Expiration</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr><td colSpan={10} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>
          ) : safeRows.length === 0 ? (
            <tr><td colSpan={10} className="px-4 py-6 text-center text-gray-400">Aucun POS trouvé.</td></tr>
          ) : (
            safeRows.map((pos) => (
              <tr
                key={pos.id}
                className={`cursor-pointer transition-colors ${
                  pos.id === selectedId ? 'bg-sky-50 ring-1 ring-inset ring-sky-300' : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  onSelect?.(pos);
                  navigate(`/pos/${pos.id}`);
                }}
              >
                <td className="px-4 py-3 font-medium text-blue-600">{pos.code_pos}</td>
                <td className="px-4 py-3">{pos.nom}</td>
                <td className="px-4 py-3">
                  <span className={(pos.type_pos ?? pos.type) === 'RECONDUIT' ? 'text-gray-500' : 'font-medium text-emerald-700'}>
                    {TYPE_LABELS[pos.type_pos ?? pos.type] ?? (pos.type_pos ?? pos.type) ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3">{pos.partenaire?.nom ?? '—'}</td>
                <td className="px-4 py-3">{pos.dsm?.nom_complet ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">
                  {pos.latitude != null && pos.longitude != null
                    ? `${pos.latitude}, ${pos.longitude}`
                    : pos.coordonnees && pos.coordonnees.latitude != null && pos.coordonnees.longitude != null
                      ? `${pos.coordonnees.latitude}, ${pos.coordonnees.longitude}`
                      : 'Aucune'}
                </td>
                <td className="px-4 py-3"><StatusBadge statut={pos.statut} /></td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    (pos.linkage_status === 'LINKED' || pos.holder_user_id) 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {(pos.linkage_status === 'LINKED' || pos.holder_user_id) ? 'Linké' : 'Délinké'}
                  </span>
                </td>
                <td className="px-4 py-3">{pos.date_expiration}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/pos/${pos.id}/edit`); }}
                    className="text-blue-600 hover:underline"
                  >
                    Modifier
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, onClick }) {
  return (
    <th
      onClick={onClick}
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 ${onClick ? 'cursor-pointer select-none hover:text-gray-700' : ''}`}
    >
      {children}
    </th>
  );
}