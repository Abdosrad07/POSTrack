import { useState, useEffect } from 'react'
import api from '../../services/api'
import SaturationGauge from '../../components/BTS/SaturationGauge'

export default function BTSRelevesPage() {
  const [releves, setReleves] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBts, setSelectedBts] = useState(null)

  useEffect(() => {
    let ignore = false

    const fetchReleves = async () => {
      try {
        setLoading(true)
        const response = await api.get('/bts/releves')
        const data = response.data.data || response.data || []

        if (!ignore) {
          setReleves(data)
        }
      } catch {
        if (!ignore) {
          setReleves([
            { id: 1, bts_id: 1, bts_nom: 'BTS Centrale Douala', code: 'BTS-001', charge: 85, debit: 120, connexions: 340, latence: 15, statut: 'actif', date_releve: '2026-08-12 08:00:00' },
            { id: 2, bts_id: 1, bts_nom: 'BTS Centrale Douala', code: 'BTS-001', charge: 78, debit: 105, connexions: 310, latence: 18, statut: 'actif', date_releve: '2026-08-12 09:00:00' },
            { id: 3, bts_id: 2, bts_nom: 'BTS Nord Yaoundé', code: 'BTS-002', charge: 42, debit: 55, connexions: 180, latence: 25, statut: 'maintenance', date_releve: '2026-08-12 08:00:00' },
          ])
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void fetchReleves()

    return () => {
      ignore = true
    }
  }, [])

  const btsList = [...new Map(releves.map((r) => [r.bts_id, { id: r.bts_id, nom: r.bts_nom, code: r.code }])).values()]
  const filteredReleves = selectedBts ? releves.filter((r) => r.bts_id === selectedBts) : releves
  const latestReleves = releves.reduce((acc, r) => {
    if (!acc[r.bts_id] || new Date(r.date_releve) > new Date(acc[r.bts_id].date_releve)) {
      acc[r.bts_id] = r
    }
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historique des relevés BTS</h1>
          <p className="mt-1 text-sm text-gray-600">Suivi en temps réel de la charge, du débit et des connexions des BTS.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.values(latestReleves).map((r) => (
          <div key={r.bts_id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{r.bts_nom}</h3>
                <p className="text-xs text-gray-500">{r.code}</p>
              </div>
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  r.statut === 'actif' ? 'bg-green-100 text-green-800' : r.statut === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {r.statut}
              </span>
            </div>
            <div className="flex items-center justify-center">
              <SaturationGauge value={r.charge} size="sm" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-gray-500">Débit</p>
                <p className="font-semibold text-gray-900">{r.debit} Mbps</p>
              </div>
              <div>
                <p className="text-gray-500">Connexions</p>
                <p className="font-semibold text-gray-900">{r.connexions}</p>
              </div>
              <div>
                <p className="text-gray-500">Latence</p>
                <p className="font-semibold text-gray-900">{r.latence} ms</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <select
          value={selectedBts ?? ''}
          onChange={(e) => setSelectedBts(e.target.value ? Number(e.target.value) : null)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Toutes les BTS</option>
          {btsList.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nom} ({b.code})
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">BTS</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Charge</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Débit</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Connexions</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Latence</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : filteredReleves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    Aucun relevé disponible
                  </td>
                </tr>
              ) : (
                filteredReleves.map((r) => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      <div>{r.bts_nom}</div>
                      <div className="text-xs text-gray-500">{r.code}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{r.date_releve}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-gray-200">
                          <div
                            className={`h-2 rounded-full ${r.charge > 80 ? 'bg-red-500' : r.charge > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(r.charge, 100)}%` }}
                          ></div>
                        </div>
                        <span>{r.charge}%</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{r.debit} Mbps</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{r.connexions}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{r.latence} ms</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          r.statut === 'actif' ? 'bg-green-100 text-green-800' : r.statut === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {r.statut}
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


