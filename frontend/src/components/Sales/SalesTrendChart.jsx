import React from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import ChartCard from '../Dashboard/ChartCard';

/**
 * Graphique de tendance mensuelle — Prévision vs Réalisation.
 * Affiche les données du tableau mensuel sous forme de courbes/aires empilées.
 */
const SalesTrendChart = ({ data, loading = false }) => {
  if (!data) return null;

  const sections = [
    { key: 'sell_out', label: 'Sell-out', color: '#22c55e', lightColor: '#dcfce7' },
    { key: 'loading', label: 'Loading', color: '#06b6d4', lightColor: '#cffafe' },
    { key: 'creation', label: 'Création', color: '#6366f1', lightColor: '#e0e7ff' },
    { key: 'redeploiement', label: 'Redéploiement', color: '#f59e0b', lightColor: '#fef3c7' },
  ];

  const availableSections = sections.filter((s) => data?.[s.key]?.rows?.length);

  if (!availableSections.length) {
    return (
      <ChartCard title="Tendance mensuelle" subtitle="Évolution des prévisions vs réalisations">
        <div className="flex h-48 items-center justify-center text-sm text-slate-400">
          Aucune donnée mensuelle disponible pour les graphiques.
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Tendance mensuelle"
      subtitle="Évolution des prévisions vs réalisations"
      loading={loading}
    >
      <div className="space-y-6">
        {availableSections.map((section) => {
          const rows = data[section.key]?.rows || [];
          const chartData = rows.map((row) => ({
            period: row.period || row.date,
            Prévision: Number(row.prevision) || 0,
            Réalisation: Number(row.realisation) || 0,
          }));

          return (
            <div key={section.key}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {section.label}
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${section.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={section.color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={section.color} stopOpacity={0} />
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
                    fill="url(#grad-default)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Réalisation"
                    stroke={section.color}
                    fill={`url(#grad-${section.key})`}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
};

/**
 * Graphique de progression par DSM — barres groupées objectif vs réalisation.
 */
const DSMProgressChart = ({ dsmSummary, loading = false }) => {
  const rows = Array.isArray(dsmSummary?.by_dsm) ? dsmSummary.by_dsm : [];

  if (!rows.length) {
    return (
      <ChartCard title="Progression par DSM" subtitle="Objectif vs réalisation création">
        <div className="flex h-48 items-center justify-center text-sm text-slate-400">
          Aucune donnée DSM disponible.
        </div>
      </ChartCard>
    );
  }

  const chartData = rows.map((row) => ({
    name: row.dsm_name || row.dsm_code || `DSM #${row.dsm_id}`,
    Objectif: Number(row.objectif_creation) || 0,
    Réalisation: Number(row.realisation_creation) || 0,
  }));

  return (
    <ChartCard
      title="Progression par DSM"
      subtitle="Objectif vs réalisation — création"
      loading={loading}
    >
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
    </ChartCard>
  );
};

export { SalesTrendChart, DSMProgressChart };
export default SalesTrendChart;
