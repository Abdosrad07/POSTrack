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

const features = [
  { label: 'Dashboard', to: '/dashboard', icon: '📊', desc: "Vue d'ensemble" },
  { label: 'DSM', to: '/dsm', icon: '👥', desc: 'Directeurs terrain' },
  { label: 'POS du partenaire', to: '/partenaires/pos', icon: '📍', desc: 'Points de vente' },
  { label: 'BTS', to: '/bts', icon: '📶', desc: 'Stations' },
  { label: 'Suivi des ventes', to: '/ventes', icon: '📈', desc: 'Revenus & objectifs' },
  { label: 'Requêtes', to: '/requetes', icon: '📋', desc: 'Demandes ouvertes' },
  { label: 'Primes', to: '/primes', icon: '💰', desc: 'Performance' },
  { label: 'Stock SIM', to: '/sims', icon: '📱', desc: 'Inventaire' },
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
          posService.getEnriched({ limit: 100 }),
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
      {/* Page header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Accueil partenaire avec accès direct aux fonctionnalités métier — <span className="font-semibold text-brand-600">{partnerTitle}</span>.
        </p>
      </div>

      {/* Partner identity */}
      <div className="animate-fade-in stagger-1">
        <PartnerIdentityCard identity={identity} loading={loading} />
      </div>

      {/* Feature navigation */}
      <div className="card overflow-hidden animate-fade-in stagger-2">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Fonctionnalités</h2>
            <p className="text-xs text-slate-500">Sélectionnez un module pour accéder à la vue correspondante.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/select-partner')}
            className="btn btn-secondary btn-sm"
          >
            Changer de partenaire
          </button>
        </div>
        <div className="card-body grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Link
              key={feature.label}
              to={feature.to}
              className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 text-left transition-all duration-200 hover:border-brand-200 hover:bg-brand-50/50 hover:shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-xs transition-transform duration-200 group-hover:scale-110 group-hover:shadow-sm">
                {feature.icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-700 transition-colors">{feature.label}</p>
                <p className="text-xs text-slate-500">{feature.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Analytics + Primes & SIM */}
      <div className="grid gap-6 lg:grid-cols-2 animate-fade-in stagger-3">
        {/* Analytics overview */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="text-lg font-bold text-slate-900">Aperçu analytique</h2>
          </div>
          <div className="card-body grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:bg-sky-50/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Parc POS</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{loading ? '…' : stats?.pos_total ?? 0}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:bg-emerald-50/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">POS actifs</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{loading ? '…' : (stats?.pos_nouveau ?? 0) + (stats?.pos_reconduit ?? 0)}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:bg-violet-50/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">BTS saturées</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{loading ? '…' : stats?.bts_saturees ?? 0}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:bg-amber-50/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requêtes ouvertes</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{loading ? '…' : stats?.requetes_ouvertes ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Primes & SIM */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="text-lg font-bold text-slate-900">Primes &amp; SIM</h2>
          </div>
          <div className="card-body grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 transition-colors hover:bg-indigo-50">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Primes en attente</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{loading ? '…' : stats?.primes_en_attente ?? 0}</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 transition-colors hover:bg-emerald-50">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Primes validées</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{loading ? '…' : stats?.primes_validees ?? 0}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:bg-sky-50/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">SIM en stock</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{loading ? '…' : stats?.sim_en_stock ?? 0}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:bg-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">SIM assignées</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{loading ? '…' : stats?.sim_assignees ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* POS Map */}
      <div className="card overflow-hidden animate-fade-in stagger-4">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Carte géographique POS</h2>
            <p className="text-xs text-slate-500">Étendue des points de vente du partenaire sur le territoire.</p>
          </div>
          <Link to="/ventes" className="btn btn-secondary btn-sm">
            Suivi des ventes
          </Link>
        </div>
        <div className="h-[420px] overflow-hidden border-t border-slate-100">
          <POSMap pos={recentPos as never} partnerId={partnerContextId} dsmId={undefined} />
        </div>
      </div>

      {/* Territory Map */}
      <div className="card overflow-hidden animate-fade-in stagger-5">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Territoire partenaire</h2>
            <p className="text-xs text-slate-500">Représentation géographique du territoire commercial : BTS, micro-zones et quartiers couverts.</p>
          </div>
          <Link to="/bts" className="btn btn-secondary btn-sm">
            Gestion BTS
          </Link>
        </div>
        <div className="border-t border-slate-100 p-1">
          {partnerContextId && (
            <TerritoryMap partnerId={partnerContextId} onSelect={(bts: any) => console.log('BTS sélectionné:', bts)} />
          )}
        </div>
      </div>
    </div>
  )
}
