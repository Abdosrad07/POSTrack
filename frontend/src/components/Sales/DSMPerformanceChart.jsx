import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

/**
 * Graphique de performance par DSM — barres horizontales objectif vs réalisation.
 */
const DSMPerformanceChart = ({ data, loading = false }) => {
  const rows = Array.isArray(data?.by_dsm) ? data.by_dsm : [];

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        Aucune donnée DSM disponible.
      </div>
    );
  }

  const chartData = rows.map((row) => ({
    name: row.dsm_name || row.dsm_code || `DSM #${row.dsm_id}`,
    Objectif: Number(row.objectif_creation) || 0,
    Réalisation: Number(row.realisation_creation) || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, rows.length * 50 + 40)}>
      <BarChart data={chartData} layout="vertical" barGap={2} barSize={14}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
        />
        <YAxis
          type="category"
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
          width={120}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            padding: '10px',
            fontSize: '12px',
          }}
        />
        <Legend
          verticalAlign="top"
          height={30}
          formatter={(v) => <span className="text-[11px] font-medium text-slate-600">{v}</span>}
        />
        <Bar dataKey="Objectif" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
        <Bar dataKey="Réalisation" fill="#6366f1" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DSMPerformanceChart;
