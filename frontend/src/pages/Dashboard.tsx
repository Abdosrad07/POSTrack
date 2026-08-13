import { useEffect, useState } from 'react'
import analyticsService from '../services/analyticsService'
import api from '../services/api'

type Stats = {
  total_pos: number
  pos_actifs: number
  total_partenaires: number
  total_dsm: number
  total_bts: number
  total_primes: number
  total_clients: number
}

type PosRow = {
  id: number
  code_pos: string
  nom: string
  statut: string
  type_pos: string
  partenaire?: { nom: string }
}

function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentPos, setRecentPos] = useState<PosRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        const [statsRes, posRes] = await Promise.all([
          analyticsService.getDashboard(),
          api.get('/pos', { params: { limit: 5, page: 1 } }),
        ])
        if (!ignore) {
          setStats(statsRes.data)
          setRecentPos(posRes.data?.data ?? [])
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
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Vue d'ensemble de l'activité des terminaux de paiement.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total POS" value={stats?.total_pos} loading={loading} />
        <StatCard label="POS Actifs" value={stats?.pos_actifs} loading={loading} accent="green" />
        <StatCard label="Partenaires" value={stats?.total_partenaires} loading={loading} />
        <StatCard label="Primes" value={stats?.total_primes} loading={loading} accent="indigo" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard label="DSM" value={stats?.total_dsm} loading={loading} small />
        <StatCard label="BTS" value={stats?.total_bts} loading={loading} small />
        <StatCard label="Clients" value={stats?.total_clients} loading={loading} small />
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
  value?: number
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
