import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

/**
 * Graphique de saturation BTS — barres horizontales avec seuil d'alerte.
 */
const SaturationChart = ({ btsTotal = 0, btsSaturees = 0, loading = false }) => {
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const normal = Math.max(0, btsTotal - btsSaturees);
  const percentage = btsTotal > 0 ? ((btsSaturees / btsTotal) * 100).toFixed(1) : 0;
  const isHigh = Number(percentage) > 50;

  const chartData = [
    { name: 'Normales', value: normal, fill: '#22c55e' },
    { name: 'Saturées', value: btsSaturees, fill: isHigh ? '#ef4444' : '#f59e0b' },
  ];

  return (
    <div>
      {/* Gauge-style indicator */}
      <div className="mb-4 flex items-center gap-4">
        <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${
              isHigh ? 'bg-gradient-to-r from-amber-400 to-red-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`text-sm font-bold ${isHigh ? 'text-red-600' : 'text-emerald-600'}`}>
          {percentage}%
        </span>
      </div>

      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={chartData} layout="vertical" barSize={24}>
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} width={80} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '10px',
              fontSize: '13px',
            }}
            formatter={(value) => [`${value} BTS`, '']}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>Normales : <span className="font-semibold text-slate-700">{normal}</span></span>
        <span>Saturées : <span className={`font-semibold ${isHigh ? 'text-red-600' : 'text-amber-600'}`}>{btsSaturees}</span></span>
        <span>Total : <span className="font-semibold text-slate-700">{btsTotal}</span></span>
      </div>
    </div>
  );
};

export default SaturationChart;
