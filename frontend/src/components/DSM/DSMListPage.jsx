import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function PartenairesListPage() {
  const [partenaires, setPartenaires] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchPartenaires = async () => {
    try {
      setLoading(true)
      const response = await api.get('/partenaires')
      setPartenaires(response.data.data || response.data || [])
    } catch {
            setPartenaires([
        { id: 2, nom: 'Master Color', email: 'contact@mastercolor.com', telephone: '+237699000003', pos_count: 1, statut: 'actif', date_debut_contrat: '2025-07-01' },
        { id: 3, nom: 'Glothelo', email: 'contact@glothelo.com', telephone: '+237699000004', pos_count: 0, statut: 'actif', date_debut_contrat: '2023-10-23' },
        { id: 4, nom: 'Odi', email: '', telephone: '', pos_count: 0, statut: 'actif', date_debut_contrat: '2026-09-01' },
        { id: 5, nom: 'Seven', email: '', telephone: '', pos_count: 0, statut: 'actif', date_debut_contrat: '2026-09-01' },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartenaires()
  }, [])

  const navigate = useNavigate()

  const filteredPartenaires = partenaires.filter((p) => {
    const matchesSearch = p.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter ? p.statut === statusFilter : true
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liste des Partenaires</h1>
          <p className="mt-1 text-sm text-gray-600">Gestion des partenaires commerciaux.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/partenaires/new')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          + Nouveau Partenaire
        </button>
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

      {/* Tableau des partenaires */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nombre de POS</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Début du contrat</th>
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
              ) : filteredPartenaires.length === 0 ? (
                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    Aucun partenaire enregistré pour le moment
                  </td>
                </tr>
              ) : (
                filteredPartenaires.map((p) => (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{p.nom}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{p.email}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{p.telephone}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{p.pos_count || 0}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${p.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {p.statut}
                       </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-50">
                      {p.date_debut_contrat ? new Date(p.date_debut_contrat).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900">Modifier</button>
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

