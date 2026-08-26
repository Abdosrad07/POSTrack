import { useEffect, useState } from 'react'
import usePartner from '../hooks/usePartner'
import analyticsService from '../services/analyticsService'
import api from '../services/api'
import { getRoleLabel } from '../utils/roles'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    const load = async () => {
      if (!partnerContextId) {
        if (!ignore) {
          setStats(null)
          setRecentPos([])
          setLoading(false)
        }
        return
      }
      try {
        const [statsRes, posRes] = await Promise.all([
          analyticsService.getDashboard(partnerContextId),
          api.get('/pos', { params: { limit: 5, page: 1 } }),
        ])
        if (!ignore) {
          setStats(statsRes.data)
          setRecentPos(normalizePosRows(posRes.data))
        }
      } catch {
        if (!ignore) {
          setStats(null)
          setRecentPos([])
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Vue d'ensemble de l'activité des terminaux de paiement.
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
          <span className="rounded-full bg-gray-100 px-3 py-1">Rôle : {getRoleLabel(user?.role)}</span>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
            Contexte : {partner?.nom ?? partner?.code_partenaire ?? (partnerContextId ? `Partenaire #${partnerContextId}` : '—')}
          </span>
        </div>
      </div>

      {!loading && !partnerContextId ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Sélectionnez un partenaire pour afficher les statistiques du dashboard.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total POS" value={stats?.pos_total} loading={loading} />
        <StatCard
          label="POS Actifs"
          value={(stats?.pos_nouveau ?? 0) + (stats?.pos_reconduit ?? 0)}
          loading={loading}
          accent="green"
        />
        <StatCard label="SIM en stock" value={stats?.sim_en_stock} loading={loading} />
        <StatCard label="Requêtes ouvertes" value={stats?.requetes_ouvertes} loading={loading} accent="indigo" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard label="BTS saturées" value={stats?.bts_saturees} loading={loading} small />
        <StatCard label="SIM assignées" value={stats?.sim_assignees} loading={loading} small />
        <StatCard
          label="Montant primes période"
          value={stats?.montant_primes_periode ? `${Number(stats.montant_primes_periode).toLocaleString('fr-FR')} FCFA` : undefined}
          loading={loading}
          small
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard label="POS nouveaux" value={stats?.pos_nouveau} loading={loading} small />
        <StatCard label="POS reconduits" value={stats?.pos_reconduit} loading={loading} small />
        <StatCard
          label="Primes validées"
          value={stats?.primes_validees}
          loading={loading}
          small
          accent="green"
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">POS récents</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Partenaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Chargement...</td>
                </tr>
              ) : recentPos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Aucun POS enregistré</td>
                </tr>
              ) : (
                recentPos.map((p) => (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-indigo-600">{p.code_pos}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{p.nom}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{p.partenaire?.nom ?? '—'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{p.type_pos}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{p.statut}</td>
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

function StatCard({
  label,
  value,
  loading,
  accent,
  small,
}: {
  label: string
  value?: number | string
  loading: boolean
  accent?: 'green' | 'indigo'
  small?: boolean
}) {
  const color = accent === 'green' ? 'text-green-600' : accent === 'indigo' ? 'text-indigo-600' : 'text-gray-900'
  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${small ? 'p-4' : 'p-6'}`}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`mt-2 ${small ? 'text-2xl' : 'text-3xl'} font-bold ${color}`}>
        {loading ? '…' : (value ?? 0)}
      </p>
    </div>
  )
}

export default Dashboard
