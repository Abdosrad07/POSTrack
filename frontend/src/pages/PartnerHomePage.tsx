import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import usePartner from '../hooks/usePartner'
import analyticsService from '../services/analyticsService'
import partenaireService from '../services/partenaireService'
import posService from '../services/posService'
import PartnerIdentityCard from '../components/Partenaires/PartnerIdentityCard'
import POSMap from '../components/POS/POSMap'
import TerritoryMap from '../components/TerritoryMap'

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

const features = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'DSM', to: '/dsm' },
  { label: 'POS créés', to: '/pos' },
  { label: 'BTS', to: '/bts' },
  { label: 'Suivi des ventes', to: '/ventes' },
  { label: 'Requêtes', to: '/requetes' },
  { label: 'Primes', to: '/primes' },
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
  const [recentPos, setRecentPos] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    const load = async () => {
      if (!partnerContextId) {
        setLoading(false)
        return
      }
      try {
        const [statsRes, identityRes, posRes] = await Promise.all([
          analyticsService.getDashboard(partnerContextId),
          partenaireService.getIdentity(partnerContextId),
          posService.getAll({ limit: 100 }),
        ])
        const posData = posRes.data?.items ?? posRes.data?.data ?? posRes.data?.results ?? posRes.data ?? []
        if (!ignore) {
          setStats(statsRes.data)
          setIdentity(identityRes.data?.data ?? identityRes.data ?? null)
          setRecentPos(Array.isArray(posData) ? posData : [])
        }
      } catch {
        if (!ignore) {
          setStats(null)
          setIdentity(null)
          setRecentPos([])
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    void load()
    return () => { ignore = true }
  }, [partnerContextId])

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
            <div className="rounded-lg bg-sky-50 p-4"><div className="text-sm text-slate-500">Parc POS</div><div className="text-2xl font-bold text-slate-900">{loading ? '…' : stats?.pos_total ?? 0}</div></div>
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
            <div className="rounded-lg bg-slate-50 p-4"><div className="text-sm text-slate-500">SIM en stock</div><div className="text-2xl font-bold text-slate-900">{loading ? '…' : stats?.sim_en_stock ?? 0}</div></div>
            <div className="rounded-lg bg-slate-50 p-4"><div className="text-sm text-slate-500">SIM assignées</div><div className="text-2xl font-bold text-slate-900">{loading ? '…' : stats?.sim_assignees ?? 0}</div></div>
          </div>
        </div>
      </div>

      {/* Carte géographique des POS du partenaire (étendue & consommation) */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Carte géographique POS</h2>
            <p className="text-sm text-slate-500">Étendue des points de vente du partenaire sur le territoire.</p>
          </div>
          <Link
            to="/ventes"
            className="rounded-lg border border-sky-300 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50"
          >
            Suivi des ventes
          </Link>
        </div>
        <div className="h-[420px] overflow-hidden rounded-lg border border-slate-200">
          <POSMap pos={recentPos as never} partnerId={partnerContextId} dsmId={undefined} />
        </div>
      </div>

      {/* Carte territoriale du partenaire (BTS, micro-zones, zones) */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Territoire partenaire</h2>
            <p className="text-sm text-slate-500">Représentation géographique du territoire commercial : BTS, micro-zones et quartiers couverts.</p>
          </div>
          <Link
            to="/bts"
            className="rounded-lg border border-sky-300 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50"
          >
            Gestion BTS
          </Link>
        </div>
        {partnerContextId && (
          <TerritoryMap partnerId={partnerContextId} onSelect={(bts: any) => console.log('BTS sélectionné:', bts)} />
        )}
      </div>
    </div>
  )
}