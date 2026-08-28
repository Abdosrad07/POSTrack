import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

/**
 * Graphique de tendance mensuelle — Prévision vs Réalisation.
 * Affiche les données sous forme de courbes/aires empilées.
 */
const MonthlyTrendChart = ({ rows = [], title = 'Tendance', loading = false }) => {
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!rows?.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        Aucune donnée disponible pour « {title} ».
      </div>
    );
  }

  const chartData = rows.map((row) => ({
    period: row.period || row.date || '—',
    Prévision: Number(row.prevision) || 0,
    Réalisation: Number(row.realisation) || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-prevision-${title}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={`grad-realis-${title}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="period"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          interval="preserveStartEnd"
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          width={45}
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
          height={28}
          formatter={(v) => <span className="text-[11px] font-medium text-slate-600">{v}</span>}
        />
        <Area
          type="monotone"
          dataKey="Prévision"
          stroke="#cbd5e1"
          fill={`url(#grad-prevision-${title})`}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Area
          type="monotone"
          dataKey="Réalisation"
          stroke="#6366f1"
          fill={`url(#grad-realis-${title})`}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MonthlyTrendChart;
