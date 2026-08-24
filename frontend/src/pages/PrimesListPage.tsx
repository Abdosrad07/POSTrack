import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

type Prime = {
  id: number
  montant: number | string
  // Backend : champ "status" (+ anciennement "statut" selon les versions)
  status?: string
  statut?: string
  // Backend : "created_at" ; "date_attribution" conservé par compatibilité
  created_at?: string
  date_attribution?: string
  pos_id?: number
  pos?: { code_pos?: string; nom?: string; partenaire?: { nom?: string } }
  partenaire?: { nom?: string }
  // Champs d'affichage enrichis côté backend (prime_service.list_primes)
  pos_code?: string
  pos_nom?: string
  partner_name?: string
  period_code?: string
}

function PrimesListPage() {
  const navigate = useNavigate()
  const [primes, setPrimes] = useState<Prime[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    const fetchPrimes = async () => {
      try {
        setLoading(true)
        const response = await api.get('/primes')
                        const data = response.data?.items ?? response.data?.data ?? response.data ?? []
        if (!ignore) setPrimes(Array.isArray(data) ? data : [])
      } catch {
        if (!ignore) setPrimes([])
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    void fetchPrimes()
    return () => { ignore = true }
  }, [])

  const statutLabel = (s?: string) => (s ?? '').toLowerCase().replace('_', ' ') || '—'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Primes</h1>
          <p className="mt-1 text-sm text-gray-600">
            Suivi des primes attribuées aux nouveaux POS.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/primes/new')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          + Nouvelle prime
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">POS</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Partenaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Chargement...</td>
                </tr>
              ) : primes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    Aucune prime enregistrée pour le moment
                  </td>
                </tr>
              ) : (
                primes.map((p) => (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {p.pos_nom ?? p.pos?.nom ?? (p.pos_id ? `POS #${p.pos_id}` : `POS #${p.id}`)}
                      {(p.pos_code ?? p.pos?.code_pos) && (
                        <div className="text-xs text-gray-500">{p.pos_code ?? p.pos?.code_pos}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {p.partner_name ?? p.partenaire?.nom ?? p.pos?.partenaire?.nom ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {Number(p.montant).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {(p.created_at ?? p.date_attribution ?? '').slice(0, 10) || '—'}
                      {p.period_code && (
                        <div className="text-xs text-gray-400">{p.period_code}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <span className="inline-flex rounded-full bg-indigo-100 px-2 text-xs font-semibold text-indigo-800">
                        {statutLabel(p.status ?? p.statut)}
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

export default PrimesListPage
