const STYLES = {
  ACTIF: 'bg-green-100 text-green-800',
  actif: 'bg-green-100 text-green-800',
  SUSPENDU: 'bg-yellow-100 text-yellow-800',
  suspendu: 'bg-yellow-100 text-yellow-800',
  RENOUVELLEMENT: 'bg-blue-100 text-blue-800',
  renouvellement: 'bg-blue-100 text-blue-800',
  CLOTURE: 'bg-red-100 text-red-800',
  cloture: 'bg-red-100 text-red-800',
  INACTIF: 'bg-red-100 text-red-800',
  inactif: 'bg-red-100 text-red-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
};

export default function StatusBadge({ statut }) {
  const label = statut ?? '—';
  const style = STYLES[statut] ?? STYLES[String(statut).toLowerCase()] ?? 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
}
