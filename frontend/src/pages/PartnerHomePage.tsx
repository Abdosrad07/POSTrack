import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import usePartner from '../hooks/usePartner'
import analyticsService from '../services/analyticsService'
import partenaireService from '../services/partenaireService'
import PartnerIdentityCard from '../components/Partenaires/PartnerIdentityCard'
import SalesProgressCard from '../components/Sales/SalesProgressCard'
import LoadingSummaryCard from '../components/Sales/LoadingSummaryCard'
import MonthlyTableCard from '../components/Sales/MonthlyTableCard'

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

/** Fiche d'identité renvoyée par GET /api/partenaires/{id}/identity (étape 5). */
type Identity = {
  id?: number
  code?: string | null
  name?: string | null
  address?: string | null
  is_active?: boolean | null
  contract_start_date?: string | null
  created_at?: string | null
  responsable_name?: string | null
  responsable_contact?: string | null
  responsable_user_id?: number | null
  responsable_username?: string | null
  commercial_name?: string | null
  commercial_contact?: string | null
  commercial_user_id?: number | null
  commercial_username?: string | null
  master_sim_number?: string | null
  nb_micro_zones?: number
  nb_pos_crees?: number
  nb_pos_actifs?: number
  nb_bts?: number
}

/** Charge utile brute des endpoints analytics ; le détail est consommé par les cartes enfants. */
type AnalyticsPayload = Record<string, unknown>

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
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [salesSummary, setSalesSummary] = useState<AnalyticsPayload | null>(null)
  const [loadingSummary, setLoadingSummary] = useState<AnalyticsPayload | null>(null)
  const [monthlyTable, setMonthlyTable] = useState<AnalyticsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingPeriod, setLoadingPeriod] = useState<{ period_start?: string; period_end?: string }>({})

  useEffect(() => {
    let ignore = false
    const load = async () => {
      if (!partnerContextId) {
        setLoading(false)
        return
      }
      try {
        const [statsRes, identityRes, salesRes] = await Promise.all([
          analyticsService.getDashboard(partnerContextId),
          partenaireService.getIdentity(partnerContextId),
          analyticsService.getSalesSummary(partnerContextId),
        ])
          const [loadingRes, monthlyRes] = await Promise.all([
            analyticsService.getLoadingSummary(partnerContextId, loadingPeriod),
            analyticsService.getMonthlyTable(partnerContextId),
          ])
        if (!ignore) {
          setStats(statsRes.data)
          setIdentity(identityRes.data?.data ?? identityRes.data ?? null)
          setSalesSummary(salesRes.data ?? null)
          setLoadingSummary(loadingRes.data ?? null)
          setMonthlyTable(monthlyRes.data ?? null)
        }
      } catch {
        if (!ignore) {
          setStats(null)
          setIdentity(null)
          setSalesSummary(null)
          setLoadingSummary(null)
          setMonthlyTable(null)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    void load()
    return () => { ignore = true }
  }, [partnerContextId, loadingPeriod])

  const partnerTitle = partner?.nom ?? partner?.code_partenaire ?? (partnerContextId ? `Partenaire #${partnerContextId}` : 'Partenaire')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Accueil partenaire avec accès direct aux fonctionnalités métier — <span className="font-medium">{partnerTitle}</span>.
        </p>
      </div>

            <PartnerIdentityCard identity={identity} loading={loading} />

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

      <SalesProgressCard data={salesSummary} />

      <LoadingSummaryCard
        data={loadingSummary}
        onPeriodChange={setLoadingPeriod}
      />

      <MonthlyTableCard data={monthlyTable} />
    </div>
  )
}