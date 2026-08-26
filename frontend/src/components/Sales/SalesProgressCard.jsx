import React from 'react'

const formatValue = (value) => {
  if (value === null || value === undefined) return 'Non renseigné'
  return value
}

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'Non renseigné'
  return `${new Intl.NumberFormat('fr-FR').format(Number(value))} FCFA`
}

const clampPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null
  return Math.max(0, Math.min(100, Number(value)))
}

function ProgressRow({ label, block, accent = 'indigo' }) {
  const percent = clampPercent(block?.progression)
  const width = percent === null ? 0 : percent
  const barClass = accent === 'emerald' ? 'bg-emerald-500' : accent === 'amber' ? 'bg-amber-500' : 'bg-indigo-500'

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
          <p className="text-xs text-slate-500">
            Cumul : <span className="font-medium text-slate-700">{formatValue(block?.cumul)}</span>
            {' '}· Objectif : <span className="font-medium text-slate-700">{formatValue(block?.objectif)}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-slate-900">
            {percent === null ? 'Non renseigné' : `${percent.toFixed(1)}%`}
          </div>
          <div className="text-xs text-slate-500">Progression</div>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${width}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 sm:grid-cols-3">
        <div><span className="font-medium text-slate-700">Stock initial :</span> {formatValue(block?.stock_initial)}</div>
        <div><span className="font-medium text-slate-700">Cumul :</span> {formatValue(block?.cumul)}</div>
        <div><span className="font-medium text-slate-700">Objectif :</span> {formatValue(block?.objectif)}</div>
        {block?.recette != null && (
          <div className="col-span-2 sm:col-span-3"><span className="font-medium text-slate-700">Recettes :</span> {formatCurrency(block.recette)}</div>
        )}
      </div>
    </div>
  )
}

export default function SalesProgressCard({ data }) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Progressions par catégorie</h2>
        <p className="text-sm text-slate-600">Niveau partenaire : création, redéploiement, sell-out et loading.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ProgressRow label="Création" block={data?.creation} accent="indigo" />
        <ProgressRow label="Redéploiement" block={data?.redeploiement} accent="amber" />
        <ProgressRow label="Sell-out" block={data?.sell_out} accent="emerald" />
        <ProgressRow label="Loading" block={data?.loading} accent="indigo" />
      </div>
    </section>
  )
}