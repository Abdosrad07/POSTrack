import { useEffect, useState } from 'react'
import usePartner from '../hooks/usePartner'
import analyticsService from '../services/analyticsService'
import partenaireService from '../services/partenaireService'
import api from '../services/api'
import { getRoleLabel } from '../utils/roles'
import PartnerIdentityCard from '../components/Partenaires/PartnerIdentityCard'
import POSLinkageStatsCard from '../components/POS/POSLinkageStatsCard'
import StatCard from '../components/Dashboard/StatCard'
import ChartCard from '../components/Dashboard/ChartCard'
import POSDistributionChart from '../components/Dashboard/POSDistributionChart'
import SaturationChart from '../components/Dashboard/SaturationChart'
import PrimeChart from '../components/Dashboard/PrimeChart'
import SIMStockChart from '../components/Dashboard/SIMStockChart'

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

type PosRow = {
  id: number
  code_pos: string
  nom: string
  statut: string
  type_pos: string
  linkage_status?: string
  partenaire?: { nom: string }
}

type PartnerContext = {
  nom?: string
  name?: string
  code_partenaire?: string
  code?: string
}

type PosApiRow = {
  id?: number
  code_pos?: string
  code?: string
  nom?: string
  name?: string
  statut?: string
  status?: string
  type_pos?: string
  type?: string
  linkage_status?: string
  holder_user_id?: number | null
  partenaire?: { nom?: string; name?: string; code_partenaire?: string }
}

type ListEnvelope = { items?: PosApiRow[]; data?: PosApiRow[]; results?: PosApiRow[] }

const normalizePosRows = (payload: unknown): PosRow[] => {
  const envelope = (typeof payload === 'object' && payload !== null ? payload : {}) as ListEnvelope
  const rows = Array.isArray(envelope.items)
    ? envelope.items
    : Array.isArray(envelope.data)
      ? envelope.data
      : Array.isArray(envelope.results)
        ? envelope.results
        : Array.isArray(payload)
          ? (payload as PosApiRow[])
          : []

  return rows.map((row) => ({
    id: row?.id ?? 0,
    code_pos: row?.code_pos || row?.code || '',
    nom: row?.nom || row?.name || '',
    statut: row?.statut || row?.status || '',
    type_pos: row?.type_pos || row?.type || '',
    linkage_status: row?.linkage_status || (row?.holder_user_id ? 'LINKED' : 'UNLINKED'),
    partenaire: row?.partenaire
      ? { nom: row.partenaire?.nom || row.partenaire?.name || row.partenaire?.code_partenaire || '' }
      : undefined,
  }))
}

function Dashboard() {
  const { partnerContextId, partner, user } = usePartner() as {
    partnerContextId: number | null
    partner: PartnerContext | null
    user: { role?: string } | null
  }
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentPos, setRecentPos] = useState<PosRow[]>([])
  const [identity, setIdentity] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    const load = async () => {
      if (!partnerContextId) {
        if (!ignore) {
          setStats(null)
          setRecentPos([])
          setIdentity(null)
          setLoading(false)
        }
        return
      }
      try {
        const [statsRes, posRes, identityRes] = await Promise.all([
          analyticsService.getDashboard(partnerContextId),
          api.get('/pos', { params: { limit: 5, page: 1 } }),
          partenaireService.getIdentity(partnerContextId),
        ])
        if (!ignore) {
          setStats(statsRes.data)
          setRecentPos(normalizePosRows(posRes.data))
          setIdentity(identityRes.data?.data ?? identityRes.data ?? null)
        }
      } catch {
        if (!ignore) {
          setStats(null)
          setRecentPos([])
          setIdentity(null)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    void load()
    return () => { ignore = true }
  }, [partnerContextId])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Vue d&apos;ensemble de l&apos;activité des terminaux de paiement.
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Rôle : {getRoleLabel(user?.role)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50 px-3 py-1 text-indigo-700 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            {partner?.nom ?? partner?.code_partenaire ?? (partnerContextId ? `Partenaire #${partnerContextId}` : '—')}
          </span>
        </div>
      </div>

      {/* No partner selected */}
      {!loading && !partnerContextId ? (
        <div className="glass rounded-2xl border border-amber-200/60 bg-amber-50/50 px-5 py-4 text-sm text-amber-900 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-sm font-bold text-amber-600">
              !
            </span>
            <p className="font-medium">Sélectionnez un partenaire pour afficher les statistiques du dashboard.</p>
          </div>
        </div>
      ) : null}

      {/* Partner identity card */}
      {partnerContextId && (
        <div className="animate-fade-in stagger-1">
          <PartnerIdentityCard identity={identity as never} loading={loading} />
        </div>
      )}

      {/* Primary stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in stagger-2">
        <StatCard
          label="Parc POS"
          value={loading ? undefined : stats?.pos_total ?? 0}
          loading={loading}

        />
        <StatCard
          label="POS actifs"
          value={loading ? undefined : (stats?.pos_nouveau ?? 0) + (stats?.pos_reconduit ?? 0)}
          loading={loading}
          accent="green"

        />
        <StatCard
          label="SIM en stock"
          value={loading ? undefined : stats?.sim_en_stock ?? 0}
          loading={loading}
          accent="sky"

        />
        <StatCard
          label="Requêtes ouvertes"
          value={loading ? undefined : stats?.requetes_ouvertes ?? 0}
          loading={loading}
          accent="amber"

        />
      </div>

      {/* Secondary stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 animate-fade-in stagger-3">
        <StatCard
          label="BTS saturées"
          value={loading ? undefined : stats?.bts_saturees ?? 0}
          loading={loading}
          accent="red"

          small
        />
        <StatCard
          label="SIM assignées"
          value={loading ? undefined : stats?.sim_assignees ?? 0}
          loading={loading}
          accent="indigo"

          small
        />
        <StatCard
          label="Montant primes période"
          value={loading ? undefined : stats?.montant_primes_periode ? `${Number(stats.montant_primes_periode).toLocaleString('fr-FR')} FCFA` : '0 FCFA'}
          loading={loading}
          accent="green"

          small
        />
      </div>

      {/* Tertiary stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 animate-fade-in stagger-4">
        <StatCard
          label="POS créés"
          value={loading ? undefined : stats?.pos_nouveau ?? 0}
          loading={loading}

          small
        />
        <StatCard
          label="POS reconduits"
          value={loading ? undefined : stats?.pos_reconduit ?? 0}
          loading={loading}

          small
        />
        <StatCard
          label="Primes validées"
          value={loading ? undefined : stats?.primes_validees ?? 0}
          loading={loading}
          accent="green"

          small
        />
      </div>

      {/* ── Graphiques analytiques ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-fade-in stagger-5">
        {/* POS Distribution */}
        <ChartCard title="Répartition des POS" subtitle="Distribution par statut">
          <POSDistributionChart
            loading={loading}
            data={[
              { name: 'Nouveaux', value: stats?.pos_nouveau ?? 0 },
              { name: 'Reconduits', value: stats?.pos_reconduit ?? 0 },
              { name: 'Total', value: stats?.pos_total ?? 0 },
            ]}
          />
        </ChartCard>

        {/* Saturation BTS */}
        <ChartCard title="Saturation BTS" subtitle="Ratio BTS normales vs saturées">
          <SaturationChart
            loading={loading}
            btsTotal={(stats?.pos_total ?? 0)}
            btsSaturees={stats?.bts_saturees ?? 0}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-fade-in stagger-6">
        {/* Primes Donut */}
        <ChartCard title="Statut des Primes" subtitle="Validation des primes">
          <PrimeChart
            loading={loading}
            primesEnAttente={stats?.primes_en_attente ?? 0}
            primesValidees={stats?.primes_validees ?? 0}
          />
        </ChartCard>

        {/* SIM Stock */}
        <ChartCard title="Stock SIM" subtitle="Inventaire et affectation">
          <SIMStockChart
            loading={loading}
            simEnStock={stats?.sim_en_stock ?? 0}
            simAssignees={stats?.sim_assignees ?? 0}
          />
        </ChartCard>
      </div>

      {/* POS Linkage stats */}
      {partnerContextId && (
        <div className="animate-fade-in stagger-7">
          <POSLinkageStatsCard />
        </div>
      )}

      {/* Recent POS table */}
      <div className="card overflow-hidden animate-fade-in stagger-8">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">POS récents</h2>
            <p className="text-xs text-slate-500">Derniers points de vente enregistrés</p>
          </div>
          <span className="section-label text-slate-400">
            {loading ? '…' : `${recentPos.length} entrée(s)`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/80">
              <tr>
                {['Code', 'Nom', 'Partenaire', 'Type', 'Statut', 'Linkage'].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      <span className="text-sm text-slate-400">Chargement…</span>
                    </div>
                  </td>
                </tr>
              ) : recentPos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                    Aucun POS enregistré
                  </td>
                </tr>
              ) : (
                recentPos.map((p) => (
                  <tr key={p.id} className="table-row-hover transition-colors">
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-brand-600">
                      {p.code_pos}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm font-medium text-slate-900">
                      {p.nom}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-500">
                      {p.partenaire?.nom ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-500">
                      {p.type_pos}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-500">
                      {p.statut}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          p.linkage_status === 'LINKED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            p.linkage_status === 'LINKED' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        {p.linkage_status === 'LINKED' ? 'Linké' : 'Délinké'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
