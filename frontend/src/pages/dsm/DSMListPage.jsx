import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
const fallbackDsms = [
  { id: 1, nom: 'DSM A', email: 'dsm.a@postrack.local', region: 'Nord', statut: 'actif' },
  { id: 2, nom: 'DSM B', email: 'dsm.b@postrack.local', region: 'Sud', statut: 'actif' },
  { id: 3, nom: 'DSM C', email: 'dsm.c@postrack.local', region: 'Est', statut: 'inactif' },
]
export default function DSMListPage() {
  const [dsms, setDsms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)
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
          setDsms(fallbackDsms)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void fetchDsms()
    return () => { mounted = false }
  }, [])
  const selectedDSM = dsms.find((d) => d.id === Number(selectedId))
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
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sélectionner un DSM</label>
              <select
                value={selectedId || ''}
                onChange={(e) => setSelectedId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                <option value="">-- Choisir un DSM --</option>
                {dsms.map((dsm) => (
                  <option key={dsm.id} value={dsm.id}>
                    {dsm.nom} ({dsm.region})
                  </option>
                ))}
              </select>
            </div>
            {selectedDSM ? (
              <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                <h2 className="text-lg font-semibold text-indigo-900">{selectedDSM.nom}</h2>
                <p className="text-sm text-gray-700">{selectedDSM.email}</p>
                <p className="mt-2 text-sm text-gray-700">Région : {selectedDSM.region}</p>
                <p className="mt-1 text-sm text-gray-700">Statut : {selectedDSM.statut}</p>
                <button
                  type="button"
                  onClick={() => navigate(`/dsm/${selectedDSM.id}`)}
                  className="mt-4 rounded-md bg-white px-3 py-2 text-sm font-medium text-indigo-700 border border-indigo-200 hover:bg-indigo-50"
                >
                  Voir le détail
                </button>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                Sélectionnez un DSM pour voir plus de détails.
              </div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Table de sélection</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">DSM</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Région</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500">Chargement...</td>
                  </tr>
                ) : dsms.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500">Aucun DSM disponible.</td>
                  </tr>
                ) : (
                  dsms.map((dsm) => (
                    <tr key={dsm.id} className={selectedId === String(dsm.id) ? 'bg-indigo-50' : ''}>
                      <td className="px-4 py-3 text-gray-900">{dsm.nom}</td>
                      <td className="px-4 py-3 text-gray-700">{dsm.region}</td>
                      <td className="px-4 py-3 text-gray-700">{dsm.statut}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
