import React from 'react'

const formatValue = (value) => (value === null || value === undefined ? 'Non renseigné' : new Intl.NumberFormat('fr-FR').format(Number(value)))

const Badge = ({ label }) => {
  const color = label === 'Atteint' ? 'bg-emerald-100 text-emerald-800' : label === 'En cours' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${color}`}>{label || 'Non renseigné'}</span>
}

const TableSection = ({ title, rows }) => (
  <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 px-4 py-3">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Prévision</th>
            <th className="px-4 py-3 text-left">Cumul prévision</th>
            <th className="px-4 py-3 text-left">Réalisation</th>
            <th className="px-4 py-3 text-left">Cumul réalisation</th>
            <th className="px-4 py-3 text-left">Écart</th>
            <th className="px-4 py-3 text-left">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {rows?.length ? rows.map((row) => (
            <tr key={`${title}-${row.period}`}>
              <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{row.date ? new Date(row.date).toLocaleDateString('fr-FR') : row.period}</td>
              <td className="px-4 py-3">{formatValue(row.prevision)}</td>
              <td className="px-4 py-3">{formatValue(row.cumul_prevision)}</td>
              <td className="px-4 py-3">{formatValue(row.realisation)}</td>
              <td className="px-4 py-3">{formatValue(row.cumul_realisation)}</td>
              <td className="px-4 py-3">{formatValue(row.ecart)}</td>
              <td className="px-4 py-3"><Badge label={row.statut} /></td>
            </tr>
          )) : (
            <tr><td className="px-4 py-6 text-slate-500" colSpan={7}>Aucune donnée disponible.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </section>
)

export default function MonthlyTableCard({ data }) {
  if (!data) return null
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Tableau mensuel</h2>
        <p className="text-sm text-slate-600">Suivi temporel des réalisations et prévisions par période.</p>
      </div>
      <div className="grid gap-4">
        <TableSection title="Sell-out" rows={data.sell_out?.rows} />
        <TableSection title="Loading" rows={data.loading?.rows} />
        <TableSection title="Création" rows={data.creation?.rows} />
        <TableSection title="Redéploiement" rows={data.redeploiement?.rows} />
      </div>
    </section>
  )
}