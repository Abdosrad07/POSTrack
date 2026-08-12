import { useParams, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const fallbackDsms = [
  { id: 1, nom: 'DSM A', email: 'dsm.a@postrack.local', region: 'Nord', statut: 'actif', telephone: '+33 1 23 45 67 89' },
  { id: 2, nom: 'DSM B', email: 'dsm.b@postrack.local', region: 'Sud', statut: 'actif', telephone: '+33 1 98 76 54 32' },
  { id: 3, nom: 'DSM C', email: 'dsm.c@postrack.local', region: 'Est', statut: 'inactif', telephone: '+33 1 11 22 33 44' },
]

export default function DSMDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dsm, setDsm] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const fetchDsm = async () => {
      try {
        const response = await api.get(`/dsm/${id}`)
        if (active) {
          setDsm(response.data || null)
        }
      } catch (error) {
        if (active) {
          setDsm(fallbackDsms.find((item) => String(item.id) === String(id)) || null)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchDsm()
    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return <div className="text-gray-700">Chargement des détails du DSM...</div>
  }

  if (!dsm) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
        <p>DSM introuvable.</p>
        <button
          type="button"
          onClick={() => navigate('/dsm')}
          className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Retour à la liste DSM
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Détails du DSM</h1>
            <p className="mt-1 text-sm text-gray-600">Informations complètes pour le DSM sélectionné.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dsm')}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Retour
          </button>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-sm font-semibold text-gray-600">Nom</h2>
            <p className="mt-2 text-lg font-medium text-gray-900">{dsm.nom}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-sm font-semibold text-gray-600">Email</h2>
            <p className="mt-2 text-lg font-medium text-gray-900">{dsm.email}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-sm font-semibold text-gray-600">Région</h2>
            <p className="mt-2 text-lg font-medium text-gray-900">{dsm.region}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-sm font-semibold text-gray-600">Statut</h2>
            <p className="mt-2 text-lg font-medium text-gray-900">{dsm.statut}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:col-span-2">
            <h2 className="text-sm font-semibold text-gray-600">Téléphone</h2>
            <p className="mt-2 text-lg font-medium text-gray-900">{dsm.telephone || 'Non renseigné'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
