import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import usePartner from '../hooks/usePartner'
import analyticsService from '../services/analyticsService'
import api from '../services/api'

type PartnerOverview = {
  code?: string
  name?: string
  address?: string | null
  is_active?: boolean
  bts_import_file_path?: string | null
  created_at?: string
}

type Stats = {
  partner_name?: string
  pos_total?: number
  pos_nouveau?: number
  pos_reconduit?: number
  primes_en_attente?: number
  primes_validees?: number
  montant_primes_periode?: string | number
  requetes_ouvertes?: number
  bts_saturees?: number
  sim_en_stock?: number
  sim_assignees?: number
}

type PartnerContext = {
  nom?: string
  name?: string
  code_partenaire?: string
  code?: string
}

const features = [
  { label: 'DSM', to: '/dsm' },
  { label: 'POS', to: '/pos' },
  { label: 'Requêtes', to: '/requetes' },
  { label: 'Primes', to: '/primes' },
  { label: 'BTS', to: '/bts' },
  { label: 'Stock SIM', to: '/sims' },
]

export default function PartnerHomePage() {
  const navigate = useNavigate()
  const { partnerContextId, partner } = usePartner() as {
    partnerContextId: number | null
    partner: PartnerContext | null
  }
  const [stats, setStats] = useState<Stats | null>(null)
  const [overview, setOverview] = useState<PartnerOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    const load = async () => {
      if (!partnerContextId) {
        setLoading(false)
        return
      }
      try {
        const [statsRes, detailsRes] = await Promise.all([
          analyticsService.getDashboard(partnerContextId),
          api.get(`/partenaires/${partnerContextId}`, { headers: { 'X-Skip-Partner-Context': 'true' } }),
        ])
        if (!ignore) {
          setStats(statsRes.data)
          const p = detailsRes.data?.data ?? detailsRes.data ?? {}
          setOverview({
            code: p.code,
            name: p.name,
            address: p.address,
            is_active: p.is_active,
            bts_import_file_path: p.bts_import_file_path ?? null,
            created_at: p.created_at,
          })
        }
      } catch {
        if (!ignore) {
          setStats(null)
          setOverview(null)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    void load()
    return () => { ignore = true }
  }, [partnerContextId])

  const partnerTitle = partner?.nom ?? partner?.code_partenaire ?? (partnerContextId ? `Partenaire #${partnerContextId}` : 'Partenaire')

  const infoCards = useMemo(() => [
    ['Code partenaire', overview?.code],
    ['Nom', overview?.name],
    ['Adresse', overview?.address],
    ['Statut', overview?.is_active === undefined ? undefined : (overview?.is_active ? 'ACTIF' : 'INACTIF')],
    ['Créé le', overview?.created_at ? String(overview.created_at).slice(0, 10) : undefined],
    ['Fichier import BTS', overview?.bts_import_file_path ? 'déposé' : undefined],
  ], [overview])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Accueil partenaire avec accès direct aux fonctionnalités métier — <span className="font-medium">{partnerTitle}</span>.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {infoCards.map(([label, value]) => (
          <div key={label as string} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label as string}</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{loading ? '…' : String(value ?? '—')}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Fonctionnalités</h2>
            <p className="text-sm text-slate-500">Sélectionnez un module pour accéder à la vue correspondante.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/select-partner')}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Changer de partenaire
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.label}
              to={feature.to}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 transition hover:border-sky-300 hover:bg-sky-50"
            >
              {feature.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Aperçu analytique</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-sky-50 p-4"><div className="text-sm text-slate-500">POS</div><div className="text-2xl font-bold text-slate-900">{loading ? '…' : stats?.pos_total ?? 0}</div></div>
            <div className="rounded-lg bg-emerald-50 p-4"><div className="text-sm text-slate-500">POS actifs</div><div className="text-2xl font-bold text-slate-900">{loading ? '…' : (stats?.pos_nouveau ?? 0) + (stats?.pos_reconduit ?? 0)}</div></div>
            <div className="rounded-lg bg-violet-50 p-4"><div className="text-sm text-slate-500">BTS saturées</div><div className="text-2xl font-bold text-slate-900">{loading ? '…' : stats?.bts_saturees ?? 0}</div></div>
            <div className="rounded-lg bg-amber-50 p-4"><div className="text-sm text-slate-500">Requêtes ouvertes</div><div className="text-2xl font-bold text-slate-900">{loading ? '…' : stats?.requetes_ouvertes ?? 0}</div></div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Primes &amp; SIM</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-indigo-50 p-4"><div className="text-sm text-slate-500">Primes en attente</div><div className="text-2xl font-bold text-slate-900">{loading ? '…' : stats?.primes_en_attente ?? 0}</div></div>
            <div className="rounded-lg bg-indigo-50 p-4"><div className="text-sm text-slate-500">Primes validées</div><div className="text-2xl font-bold text-slate-900">{loading ? '…' : stats?.primes_validees ?? 0}</div></div>
            <div className="rounded-lg bg-slate-50 p-4 sm:col-span-2">
              <div className="text-sm text-slate-500">Montant primes période courante</div>
              <div className="text-2xl font-bold text-slate-900">
                {loading ? '…' : stats?.montant_primes_periode ? `${Number(stats.montant_primes_periode).toLocaleString('fr-FR')} FCFA` : '—'}
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4"><div className="text-sm text-slate-500">SIM en stock</div><div className="text-2xl font-bold text-slate-900">{loading ? '…' : stats?.sim_en_stock ?? 0}</div></div>
            <div className="rounded-lg bg-slate-50 p-4"><div className="text-sm text-slate-500">SIM assignées</div><div className="text-2xl font-bold text-slate-900">{loading ? '…' : stats?.sim_assignees ?? 0}</div></div>
          </div>
        </div>
      </div>
    </div>
  )
}