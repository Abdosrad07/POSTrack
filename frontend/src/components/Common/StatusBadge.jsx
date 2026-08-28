const STYLES = {
  ACTIF: 'bg-emerald-100 text-emerald-800 border border-emerald-200/60',
  actif: 'bg-emerald-100 text-emerald-800 border border-emerald-200/60',
  SUSPENDU: 'bg-amber-100 text-amber-800 border border-amber-200/60',
  suspendu: 'bg-amber-100 text-amber-800 border border-amber-200/60',
  RENOUVELLEMENT: 'bg-sky-100 text-sky-800 border border-sky-200/60',
  renouvellement: 'bg-sky-100 text-sky-800 border border-sky-200/60',
  CLOTURE: 'bg-red-100 text-red-800 border border-red-200/60',
  cloture: 'bg-red-100 text-red-800 border border-red-200/60',
  INACTIF: 'bg-red-100 text-red-800 border border-red-200/60',
  inactif: 'bg-red-100 text-red-800 border border-red-200/60',
  MAINTENANCE: 'bg-amber-100 text-amber-800 border border-amber-200/60',
  maintenance: 'bg-amber-100 text-amber-800 border border-amber-200/60',
};

const DOT_COLORS = {
  ACTIF: 'bg-emerald-500',
  actif: 'bg-emerald-500',
  SUSPENDU: 'bg-amber-500',
  suspendu: 'bg-amber-500',
  RENOUVELLEMENT: 'bg-sky-500',
  renouvellement: 'bg-sky-500',
  CLOTURE: 'bg-red-500',
  cloture: 'bg-red-500',
  INACTIF: 'bg-red-500',
  inactif: 'bg-red-500',
  MAINTENANCE: 'bg-amber-500',
  maintenance: 'bg-amber-500',
};

export default function StatusBadge({ statut }) {
  const label = statut ?? '—';
  const style = STYLES[statut] ?? STYLES[String(statut).toLowerCase()] ?? 'bg-slate-100 text-slate-700 border border-slate-200/60';
  const dot = DOT_COLORS[statut] ?? DOT_COLORS[String(statut).toLowerCase()] ?? 'bg-slate-500';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
