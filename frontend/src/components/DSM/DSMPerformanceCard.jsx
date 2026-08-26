const MetricRow = ({ label, value, subLabel, trend }) => (
  <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      {subLabel && <div className="text-xs text-gray-400">{subLabel}</div>}
    </div>
    <div className="text-right">
      <div className="text-sm font-semibold text-gray-900">{value}</div>
      {trend && (
        <div className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  </div>
);

const ProgressionBar = ({ label, value, color = 'indigo' }) => {
  const percentage = Math.min(100, Math.max(0, value));
  const colorClasses = {
    indigo: 'bg-indigo-600',
    green: 'bg-green-600',
    amber: 'bg-amber-600',
    red: 'bg-red-600'
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span className="font-medium">{label}</span>
        <span className="font-semibold">{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default function DSMPerformanceCard({ performance, loading }) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <div className="text-center text-gray-500 py-8">
          Aucune donnée de performance disponible
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-white px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Performance</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">Indicateurs clés</h2>
      </div>
      <div className="px-5 py-4">
        <MetricRow
          label="POS créés"
          value={performance.pos_crees ?? 0}
          subLabel="Total depuis le début"
        />
        <MetricRow
          label="POS actifs"
          value={performance.pos_actifs ?? 0}
          subLabel={`${performance.pos_nouveaux ?? 0} nouveaux, ${performance.pos_reconduits ?? 0} reconduits`}
        />
        <MetricRow
          label="Loading"
          value={performance.loading ?? 0}
          subLabel="SIM en stock"
        />
        <MetricRow
          label="Sell-out"
          value={performance.sell_out ?? 0}
          subLabel="Activations et ventes"
        />
        <MetricRow
          label="Recettes"
          value={performance.recettes ? `${performance.recettes.toLocaleString()} FCFA` : '—'}
          subLabel="Primes validées/payées"
        />
        
        {performance.objectifs && (
          <MetricRow
            label="Objectifs"
            value={performance.objectifs}
            subLabel="Cible mensuelle"
          />
        )}
        
        {performance.progression !== null && (
          <ProgressionBar
            label="Progression globale"
            value={performance.progression}
            color={performance.progression >= 75 ? 'green' : performance.progression >= 50 ? 'indigo' : performance.progression >= 25 ? 'amber' : 'red'}
          />
        )}
      </div>
    </div>
  );
}