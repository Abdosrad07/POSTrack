import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const DEFAULT_DATA = [
  { name: 'Actifs', value: 0 },
  { name: 'Nouveaux', value: 0 },
  { name: 'Reconduits', value: 0 },
];

/**
 * Graphique circulaire — répartition des POS par statut.
 */
const POSDistributionChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const chartData = data?.length ? data : DEFAULT_DATA;
  const total = chartData.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={2}
            stroke="#fff"
          >
            {chartData.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} (${total ? ((value / total) * 100).toFixed(1) : 0}%)`, name]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs font-medium text-slate-600">{value}</span>}
          />
          {/* Center label */}
          <text x="50%" y="48%" textAnchor="middle" dominantBaseline="central" className="fill-slate-900 text-2xl font-extrabold">
            {total}
          </text>
          <text x="50%" y="58%" textAnchor="middle" dominantBaseline="central" className="fill-slate-400 text-xs">
            Total POS
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default POSDistributionChart;
