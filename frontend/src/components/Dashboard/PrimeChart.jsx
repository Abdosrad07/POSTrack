import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#f59e0b', '#22c55e', '#6366f1'];

/**
 * Graphique donut — primes en attente vs validées.
 */
const PrimeChart = ({ primesEnAttente = 0, primesValidees = 0, loading = false }) => {
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const total = primesEnAttente + primesValidees;
  const chartData = [
    { name: 'En attente', value: primesEnAttente },
    { name: 'Validées', value: primesValidees },
  ].filter((item) => item.value > 0);

  const validationRate = total > 0 ? ((primesValidees / total) * 100).toFixed(1) : 0;

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-shrink-0">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={chartData.length ? chartData : [{ name: 'Aucune', value: 1 }]}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={2}
              stroke="#fff"
            >
              {(chartData.length ? chartData : [{ name: 'Aucune', value: 1 }]).map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={chartData.length ? COLORS[index % COLORS.length] : '#e2e8f0'}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '10px',
                fontSize: '13px',
              }}
              formatter={(value) => [`${value}`, '']}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-extrabold text-slate-900">{validationRate}%</span>
          <span className="text-[10px] text-slate-400">validées</span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-600">En attente :</span>
          <span className="font-semibold text-slate-900">{primesEnAttente}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-600">Validées :</span>
          <span className="font-semibold text-slate-900">{primesValidees}</span>
        </div>
        <div className="border-t border-slate-100 pt-2 text-xs text-slate-400">
          Total : {total} primes
        </div>
      </div>
    </div>
  );
};

export default PrimeChart;
