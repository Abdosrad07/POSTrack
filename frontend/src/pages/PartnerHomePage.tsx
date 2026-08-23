import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import usePartner from '../hooks/usePartner'
import analyticsService from '../services/analyticsService'
import api from '../services/api'

type PartnerOverview = {
  master_sim?: string
  responsable_nom?: string
  responsable_tel?: string
  commercial_nom?: string
  commercial_tel?: string
  localisation?: string
  nb_bts?: number
  nb_pos_crees?: number
  nb_pos_actifs?: number
  nb_dsm?: number
  nb_microzones?: number
  quartiers?: string[]
}

type Stats = {
  total_pos: number
  pos_actifs: number
  total_partenaires: number
  total_dsm: number
  total_bts: number
  total_primes: number
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
            master_sim: p.master_sim || p.numero_master_sim || p.sim_master || '—',
            responsable_nom: p.responsable_nom || p.nom_responsable || p.responsable || '—',
            responsable_tel: p.responsable_tel || p.telephone_responsable || '—',
            commercial_nom: p.commercial_nom || p.nom_commercial || '—',
            commercial_tel: p.commercial_tel || p.telephone_commercial || '—',
            localisation: p.localisation || p.adresse || [p.ville, p.region].filter(Boolean).join(' · ') || '—',
            nb_bts: p.nb_bts ?? statsRes.data?.total_bts ?? 0,
            nb_pos_crees: p.nb_pos_crees ?? statsRes.data?.total_pos ?? 0,
            nb_pos_actifs: p.nb_pos_actifs ?? statsRes.data?.pos_actifs ?? 0,
            nb_dsm: p.nb_dsm ?? statsRes.data?.total_dsm ?? 0,
            nb_microzones: p.nb_microzones ?? 0,
            quartiers: Array.isArray(p.quartiers) ? p.quartiers : Array.isArray(p.quartiers_couverts) ? p.quartiers_couverts : [],
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
    ['Master SIM', overview?.master_sim],
    ['Responsable', overview?.responsable_nom],
    ['Téléphone responsable', overview?.responsable_tel],
    ['Commercial', overview?.commercial_nom],
    ['Téléphone commercial', overview?.commercial_tel],
    ['Localisation', overview?.localisation],
    ['Nombre de BTS', overview?.nb_bts],
    ['POS créés', overview?.nb_pos_crees],
    ['POS actifs', overview?.nb_pos_actifs],
    ['Nombre de DSM', overview?.nb_dsm],
    ['Microzones', overview?.nb_microzones],
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
            <div className="rounded-lg bg-sky-50 p-4"><div className="text-sm text-slate-500">POS</div><div className="text-2xl font-bold text-slate-900">{loading ? '…' : stats?.total_pos ?? 0}</div></div>
            <div className="rounded-lg bg-emerald-50 p-4"><div className="text-sm text-slate-500">POS actifs</div><div className="text-2xl font-bold text-slate-900">{loading ? '…' : stats?.pos_actifs ?? 0}</div></div>
            <div className="rounded-lg bg-violet-50 p-4"><div className="text-sm text-slate-500">DSM</div><div className="text-2xl font-bold text-slate-900">{loading ? '…' : stats?.total_dsm ?? 0}</div></div>
            <div className="rounded-lg bg-amber-50 p-4"><div className="text-sm text-slate-500">BTS</div><div className="text-2xl font-bold text-slate-900">{loading ? '…' : stats?.total_bts ?? 0}</div></div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Quartiers couverts</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(overview?.quartiers || []).length ? (overview?.quartiers || []).map((q) => (
              <span key={q} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{q}</span>
            )) : <span className="text-sm text-slate-500">—</span>}
          </div>
        </div>
      </div>
    </div>
  )
}