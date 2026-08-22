import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Logo from '../../assets/logos/LOGO.jpeg'
export default function DSMListPage() {
  const [dsms, setDsms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const navigate = useNavigate()
  useEffect(() => {
    let mounted = true
    const fetchDsms = async () => {
      try {
        const response = await api.get('/dsm')
        const raw = response.data.data || response.data || []
        const data = raw.map((d) => ({
          ...d,
          nom: d.nom || d.nom_complet,
          region: d.region || d.zone_couverture,
          statut: (d.statut || 'ACTIF').toLowerCase(),
        }))
        if (mounted) {
          setDsms(data)
        }
      } catch (err) {
        if (mounted) {
          setError('Erreur lors de la récupération des DSMs.')
          setDsms([])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void fetchDsms()
    return () => { mounted = false }
  }, [])
  const selectedDSM = dsms.find((d) => d.id === Number(selectedId))

  const filteredDsms = dsms.filter((d) => {
    const matchesSearch =
      d.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.region?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter ? d.statut === statusFilter : true
    return matchesSearch && matchesStatus
  })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">DSMs</h1>
          <p className="mt-1 text-sm text-gray-600">Liste et sélection des DSM.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/dsm/new')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          + Nouveau DSM
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un DSM..."
          className="flex-1 min-w-48 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {/* List view des DSMs */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Liste des DSMs</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Région</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      Chargement...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-red-600">{error}</td>
                  </tr>
                ) : filteredDsms.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      Aucun DSM ne correspond à vos critères.
                    </td>
                  </tr>
                ) : (
                  filteredDsms.map((dsm) => (
                    <tr key={dsm.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {dsm.nom}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {dsm.region}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {dsm.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${dsm.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {dsm.statut}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <Link to={`/dsm/${dsm.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
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

        {/* Statistiques DSM */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Statistiques</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{dsms.length}</div>
              <div className="text-sm text-gray-500">Total des DSMs</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{dsms.filter((d) => d.statut === 'actif').length}</div>
              <div className="text-sm text-gray-500">Actifs</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-2xl font-bold text-red-600">{dsms.filter((d) => d.statut === 'inactif').length}</div>
              <div className="text-sm text-gray-500">Inactifs</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <img src={Logo} alt="POSTrack logo" className="h-10 w-auto" />
          <h2 className="text-lg font-semibold text-gray-900">Informations DSM sélectionné</h2>
        </div>
        {selectedId ? (
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
            <h2 className="text-lg font-semibold text-indigo-900">{selectedDSM?.nom || 'DSM'}</h2>
            <p className="text-sm text-gray-700">Email: {selectedDSM?.email || 'N/A'}</p>
            <p className="mt-1 text-sm text-gray-700">Région: {selectedDSM?.region || 'N/A'}</p>
            <p className="mt-1 text-sm text-gray-700">Statut: {selectedDSM?.statut || 'N/A'}</p>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
            Sélectionnez un DSM pour voir plus de détails.
          </div>
        )}
      </div>
    </div>
  )
}
