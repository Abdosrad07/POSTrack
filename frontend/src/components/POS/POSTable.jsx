import { useNavigate } from 'react-router-dom';
import StatusPill from '../Common/StatusPill/StatusPill';

const TYPE_LABELS = {
  NOUVEAU: 'Créé',
  RECONDUIT: 'Reconduit',
  'LIÉ': 'Lié',
  LIE: 'Lié',
};

const COLS = 12;

/**
 * Tableau des POS — tri côté serveur (sort_by/order), synchronisé avec la
 * carte (sélection) et la fiche détail (clic sur la ligne).
 */
export default function POSTable({ rows = [], loading = false, sort, onSort, onSelect, selectedId = null }) {
  const navigate = useNavigate();
  const safeRows = Array.isArray(rows) ? rows : [];

  /** En-tête triable : clic → bascule serveur asc/desc. */
  const th = (label, field) => {
    const active = field && sort?.sort_by === field;
    return (
      <th
        key={label}
        scope="col"
        aria-sort={active ? (sort.order === 'asc' ? 'ascending' : 'descending') : undefined}
        className={field ? 'sortable' : undefined}
        onClick={field ? () => onSort?.(field) : undefined}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {active ? <span aria-hidden="true">{sort.order === 'asc' ? '↑' : '↓'}</span> : null}
        </span>
      </th>
    );
  };

  return (
    <div className="data-table-container overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            {th('Code POS', 'code_pos')}
            {th('Nom', 'nom')}
            {th('Type')}
            {th('Partenaire')}
            {th('DSM')}
            {th('Coordonnées')}
            {th('Statut', 'statut')}
            {th('Linkage')}
            {th('Loading')}
            {th('Sell-out')}
            {th('Expiration', 'date_expiration')}
            {th('Actions')}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 6 }, (_, r) => (
              <tr key={`skeleton-${r}`} aria-hidden="true">
                {Array.from({ length: COLS }, (_, c) => (
                  <td key={c}>
                    <div
                      className="skeleton h-3.5 rounded"
                      style={{ width: `${45 + ((r + c) * 13) % 40}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : safeRows.length === 0 ? (
            <tr>
              <td colSpan={COLS} className="text-center text-slate-400">
                Aucun POS trouvé.
              </td>
            </tr>
          ) : (
            safeRows.map((pos) => {
              const linked = pos.linkage_status === 'LINKED' || pos.holder_user_id;
              const coords =
                pos.latitude != null && pos.longitude != null
                  ? `${pos.latitude}, ${pos.longitude}`
                  : pos.coordonnees?.latitude != null && pos.coordonnees?.longitude != null
                    ? `${pos.coordonnees.latitude}, ${pos.coordonnees.longitude}`
                    : 'Aucune';
              return (
                <tr
                  key={pos.id}
                  className={`${pos.id === selectedId ? 'row-selected' : ''} cursor-pointer`}
                  onClick={() => {
                    onSelect?.(pos);
                    navigate(`/pos/${pos.id}`);
                  }}
                >
                  <td className="whitespace-nowrap font-mono font-semibold text-brand-600">
                    {pos.code_pos}
                  </td>
                  <td className="font-medium text-slate-900">{pos.nom}</td>
                  <td>{TYPE_LABELS[pos.type_pos ?? pos.type] ?? (pos.type_pos ?? pos.type) ?? '—'}</td>
                  <td>{pos.partenaire?.nom ?? '—'}</td>
                  <td>{pos.dsm?.nom_complet ?? '—'}</td>
                  <td className="whitespace-nowrap text-slate-500">{coords}</td>
                  <td><StatusPill status={pos.statut} /></td>
                  <td><StatusPill status={linked ? 'Linké' : 'Délinké'} /></td>
                  <td className="font-semibold tabular-nums text-brand-600">{pos.loading ?? 0}</td>
                  <td className="font-semibold tabular-nums text-emerald-600">{pos.sell_out ?? 0}</td>
                  <td className="whitespace-nowrap">{pos.date_expiration ?? '—'}</td>
                  <td className="whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/pos/${pos.id}/edit`);
                      }}
                      className="font-medium text-brand-600 transition-colors hover:text-brand-800"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
