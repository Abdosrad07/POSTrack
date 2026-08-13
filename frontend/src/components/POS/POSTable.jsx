import { useNavigate } from 'react-router-dom';
import StatusBadge from '../Common/StatusBadge';

export default function POSTable({ rows = [], loading = false, sort, onSort }) {
  const navigate = useNavigate();

  const toggle = (field) => onSort?.(field);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <Th onClick={() => toggle('code_pos')}>Code POS</Th>
            <Th onClick={() => toggle('nom')}>Nom</Th>
            <Th>Type</Th>
            <Th>Partenaire</Th>
            <Th>DSM</Th>
            <Th onClick={() => toggle('statut')}>Statut</Th>
            <Th onClick={() => toggle('date_expiration')}>Expiration</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">Chargement...</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">Aucun POS trouvé.</td></tr>
          ) : (
            rows.map((pos) => (
              <tr
                key={pos.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/pos/${pos.id}`)}
              >
                <td className="px-4 py-3 font-medium text-blue-600">{pos.code_pos}</td>
                <td className="px-4 py-3">{pos.nom}</td>
                <td className="px-4 py-3">
                  <span className={(pos.type_pos ?? pos.type) === 'RECONDUIT' ? 'text-gray-500' : 'font-medium text-emerald-700'}>
                    {pos.type_pos ?? pos.type}
                  </span>
                </td>
                <td className="px-4 py-3">{pos.partenaire?.nom ?? '—'}</td>
                <td className="px-4 py-3">{pos.dsm?.nom_complet ?? '—'}</td>
                <td className="px-4 py-3"><StatusBadge statut={pos.statut} /></td>
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