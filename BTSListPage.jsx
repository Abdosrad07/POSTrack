import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/20/solid'

// Mocks - à remplacer par un appel service
const getBtsMock = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          nom: 'BTS-MTN-DLA-01',
          localisation: 'Douala, Akwa',
          statut: 'ACTIF',
          partenaire: 'Partenaire A',
          saturation: 75,
        },
        {
          id: 2,
          nom: 'BTS-ORA-YDE-05',
          localisation: 'Yaoundé, Mvan',
          statut: 'MAINTENANCE',
          partenaire: 'Partenaire B',
          saturation: 40,
        },
        {
          id: 3,
          nom: 'BTS-MTN-BFA-02',
          localisation: 'Bafoussam, Centre',
          statut: 'HORS_SERVICE',
          partenaire: 'Partenaire A',
          saturation: 0,
        },
      ])
    }, 1000)
  })

const statutMapping = {
  ACTIF: { text: 'Actif', color: 'bg-green-100 text-green-800' },
  MAINTENANCE: { text: 'Maintenance', color: 'bg-yellow-100 text-yellow-800' },
  HORS_SERVICE: { text: 'Hors service', color: 'bg-red-100 text-red-800' },
}

function BTSListPage() {
  const [btsList, setBtsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    getBtsMock()
      .then((data) => {
        setBtsList(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Erreur lors de la récupération des BTS.')
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liste des BTS</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestion des Base Transceiver Stations.
          </p>
        </div>
        <Link
          to="/bts/new"
          className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nouveau BTS
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Localisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Partenaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Chargement...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-red-600">{error}</td>
                </tr>
              ) : btsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Aucun BTS enregistré.</td>
                </tr>
              ) : (
                btsList.map((bts) => (
                  <tr key={bts.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bts.nom}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bts.localisation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bts.partenaire}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statutMapping[bts.statut]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {statutMapping[bts.statut]?.text || bts.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/bts/${bts.id}`} className="text-indigo-600 hover:text-indigo-900">
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
    </div>
  )
}

export default BTSListPage