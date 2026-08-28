import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = {
  creation: '#6366f1',
  redeploiement: '#f59e0b',
  sell_out: '#22c55e',
  loading: '#06b6d4',
};

/**
 * Graphique à barres — progression des ventes par catégorie.
 * Affiche cumul vs objectif pour chaque bloc.
 */
const SalesChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const categories = ['creation', 'redeploiement', 'sell_out', 'loading'];
  const labels = {
    creation: 'Création',
    redeploiement: 'Redéplo.',
    sell_out: 'Sell-out',
    loading: 'Loading',
  };

  const chartData = categories
    .filter((cat) => data?.[cat])
    .map((cat) => ({
      name: labels[cat],
      Cumul: Number(data[cat].cumul) || 0,
      Objectif: Number(data[cat].objectif) || 0,
    }));

  if (!chartData.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Aucune donnée de progression disponible.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} barGap={4} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          width={50}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '12px',
            fontSize: '13px',
          }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          formatter={(value) => <span className="text-xs font-medium text-slate-600">{value}</span>}
        />
        <Bar dataKey="Cumul" fill={COLORS.creation} radius={[6, 6, 0, 0]} maxBarSize={40} />
        <Bar dataKey="Objectif" fill="#cbd5e1" radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;
