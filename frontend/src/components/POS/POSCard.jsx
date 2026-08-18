import { useNavigate } from 'react-router-dom';
import StatusBadge from '../Common/StatusBadge';

/**
 * POSCard — représentation condensée d'un POS en carte (vue mobile/tablette,
 * ou widget Dashboard listant quelques POS). Alternative à POSTable pour les
 * écrans étroits, conformément à l'exigence responsive Desktop/Tablette.
 */
export default function POSCard({ pos }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/pos/${pos.id}`)}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">{pos.code_pos}</p>
          <p className="text-base font-medium text-gray-900">{pos.nom}</p>
        </div>
        <StatusBadge statut={pos.statut} />
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className={pos.type === 'RECONDUIT' ? 'text-gray-500' : 'font-medium text-emerald-700'}>
          {pos.type}
        </span>
        <span className="text-gray-300">·</span>
        <span className="text-gray-500">{pos.partenaire?.nom ?? '—'}</span>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        Expire le {pos.date_expiration}
      </div>
    </div>
  );
}