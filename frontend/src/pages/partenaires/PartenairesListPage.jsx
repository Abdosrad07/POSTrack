import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Logo from '../../assets/logos/LOGO.jpeg'

const getStatusStyle = (status) => {
  const normalized = (status || 'ACTIF').toUpperCase()
  const styles = {
    ACTIF: 'bg-green-100 text-green-800',
    SUSPENDU: 'bg-yellow-100 text-yellow-800',
    RESILIE: 'bg-red-100 text-red-800',
  }
  return styles[normalized] || 'bg-gray-100 text-gray-800'
}

export default function PartenairesListPage() {
  const [partenaires, setPartenaires] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchPartenaires = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/partenaires')
      const raw = response.data.data || response.data || []
      setPartenaires(
        raw.map((p) => ({
          ...p,
          code: p.code || p.code_partenaire,
          type: p.type_partenaire || 'DISTRIBUTEUR',
          region: p.region || '',
          ville: p.ville || '',
          statut: p.statut || 'ACTIF',
        }))
      )
    } catch (err) {
      setError('Erreur lors de la récupération des partenaires.')
      console.error(err)
      setPartenaires([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartenaires()
  }, [])

  const filteredPartenaires = partenaires.filter((p) => {
    const matchesSearch =
      p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Partenaires</h1>
          <p className="mt-1 text-sm text-gray-600">Liste et sélection des partenaires.</p>
        </div>
        <Link
          to="/partenaires/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          + Nouveau Partenaire
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un partenaire..."
          className="flex-1 min-w-48 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {/* List view des Partenaires */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Liste des Partenaires</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Région</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ville</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                      Chargement...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-red-600">{error}</td>
                  </tr>
                ) : filteredPartenaires.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                      Aucun partenaire ne correspond à vos critères.
                    </td>
                  </tr>
                ) : (
                  filteredPartenaires.map((p) => (
                    <tr key={p.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {p.code || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {p.nom}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {p.type || 'DISTRIBUTEUR'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {p.region || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {p.ville || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusStyle(p.statut)}`}>
                          {p.statut}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <Link to={`/partenaires/${p.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                          Détails
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistiques partenaires */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Statistiques</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{partenaires.length}</div>
              <div className="text-sm text-gray-500">Total des partenaires</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{partenaires.filter((p) => p.statut === 'ACTIF').length}</div>
              <div className="text-sm text-gray-500">Actifs</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">{partenaires.filter((p) => p.statut === 'SUSPENDU').length}</div>
              <div className="text-sm text-gray-500">Suspendus</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-2xl font-bold text-red-600">{partenaires.filter((p) => p.statut === 'RESILIE').length}</div>
              <div className="text-sm text-gray-500">Résiliés</div>
            </div>
          </div>
        </div>

        {/* Logo partenaire */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">POSTrack</h2>
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
            <img
              src={Logo}
              alt="POSTrack logo"
              className="mb-4 h-16 w-auto mx-auto"
            />
            <p className="text-sm text-gray-500">Plateforme de gestion des partenaires, DSM et POS</p>
          </div>
        </div>
      </div>
    </div>
  )
}
