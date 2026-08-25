import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import dsmService from '../../services/dsmService'
import DSMIdentityCard from '../../components/DSM/DSMIdentityCard'

export default function DSMDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dsm, setDsm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const fetchDsm = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await dsmService.getById(id)
        const identityResponse = await dsmService.getIdentity(id)
        if (active) {
          const data = response?.data || null
          setDsm(data ? {
            ...data,
            nom: data.nom || data.full_name || data.name,
            region: data.region || data.zone,
            micro_zone: data.micro_zone || data.zone,
            statut: data.statut || (data.is_active === false ? 'INACTIF' : 'ACTIF'),
            nb_pos_crees: identityResponse?.data?.nb_pos_crees ?? data.nb_pos_crees ?? 0,
          } : null)
        }
      } catch (error) {
        if (active) {
          setError(error?.apiMessage || error?.message || 'Impossible de charger le détail du DSM.')
          setDsm(null)
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
        <p>{error || 'DSM introuvable.'}</p>
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
            <p className="mt-2 text-lg font-medium text-gray-900">{dsm.nom || dsm.full_name || dsm.name || '—'}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-sm font-semibold text-gray-600">Email</h2>
            <p className="mt-2 text-lg font-medium text-gray-900">{dsm.email || '—'}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-sm font-semibold text-gray-600">Micro-zone</h2>
            <p className="mt-2 text-lg font-medium text-gray-900">{dsm.micro_zone || dsm.zone || 'Non renseigné'}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-sm font-semibold text-gray-600">POS créés</h2>
            <p className="mt-2 text-lg font-medium text-gray-900">{dsm.nb_pos_crees ?? 0}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:col-span-2">
            <h2 className="text-sm font-semibold text-gray-600">Téléphone</h2>
            <p className="mt-2 text-lg font-medium text-gray-900">{dsm.telephone || 'Non renseigné'}</p>
          </div>
        </div>
      </div>

      <DSMIdentityCard dsm={dsm} />
    </div>
  )
}
