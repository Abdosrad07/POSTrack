import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/20/solid'
import api from '../../services/api'

const getSaturationColor = (saturation) => {
  if (saturation > 80) return 'bg-red-500'
  if (saturation > 50) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getStatusBadge = (status) => {
  const styles = {
    actif: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    inactif: 'bg-red-100 text-red-800',
  }
  return styles[status] || 'bg-gray-100 text-gray-800'
}

export default function BTSListPage() {
  const [btsList, setBtsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchBts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/bts')
      const raw = response.data.data || response.data || []
      setBtsList(
        raw.map((b) => ({
          ...b,
          code: b.code || b.code_bts,
          localisation: b.localisation || b.ville,
          saturation: b.saturation ?? b.dernier_taux_saturation ?? 0,
          statut: (b.statut || 'ACTIF').toLowerCase(),
        }))
      )
    } catch (err) {
      setError('Erreur lors de la récupération des BTS.')
      console.error(err)
      // En cas d'erreur, on peut garder une liste vide ou afficher des données mockées pour le dev
      setBtsList([])
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchBts()
  }, [])

  const filteredBts = btsList.filter((b) => {
    const matchesSearch = b.code?.toLowerCase().includes(searchTerm.toLowerCase()) || b.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || b.localisation?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter ? b.statut === statusFilter : true
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des BTS</h1>
          <p className="mt-1 text-sm text-gray-600">Suivi des stations de base et de leur saturation en temps réel.</p>
        </div>
        <Link
          to="/bts/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <div className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            <span>Nouvelle BTS</span>
          </div>
        </Link>
      </div>
      <div className="flex flex-wrap gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une BTS..."
          className="flex-1 min-w-48 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactif">Inactif</option>
        </select>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Code / Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Localisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Partenaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Saturation</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-red-600">{error}</td>
                </tr>
              ) : filteredBts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    Aucune BTS ne correspond à vos critères.
                  </td>
                </tr>
              ) : (
                filteredBts.map((b) => (
                  <tr key={b.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      <div>{b.nom}</div>
                      <div className="text-xs text-gray-500">{b.code}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{b.localisation}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{b.partenaire || 'N/A'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${getSaturationColor(b.saturation)}`}
                            style={{ width: `${b.saturation}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold">{b.saturation}%</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadge(b.statut)}`}>
                        {b.statut}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <Link to={`/bts/${b.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                        Détails
                      </Link>
                      <Link to={`/bts/releves`} className="text-gray-600 hover:text-gray-900">
                        Relevés
                      </Link>
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
