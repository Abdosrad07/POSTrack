import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/**
 * Graphique de stock SIM — comparaison stock vs assignées avec barres colorées.
 */
const SIMStockChart = ({ simEnStock = 0, simAssignees = 0, loading = false }) => {
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const total = simEnStock + simAssignees;
  const chartData = [
    { name: 'En stock', value: simEnStock, fill: '#06b6d4' },
    { name: 'Assignées', value: simAssignees, fill: '#8b5cf6' },
  ];

  const usageRate = total > 0 ? ((simAssignees / total) * 100).toFixed(1) : 0;

  return (
    <div>
      {/* Summary badges */}
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
          Stock : {simEnStock}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
          Assignées : {simAssignees}
        </span>
        <span className="text-xs text-slate-500">
          Taux d'utilisation : <span className="font-bold text-slate-900">{usageRate}%</span>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} barSize={48}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} width={40} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '10px',
              fontSize: '13px',
            }}
            formatter={(value) => [`${value} SIM`, '']}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SIMStockChart;
