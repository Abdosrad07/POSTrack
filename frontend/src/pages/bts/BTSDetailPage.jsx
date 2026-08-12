import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import SaturationGauge from '../../components/BTS/SaturationGauge'

const getStatusBadge = (status) => {
  const styles = {
    actif: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    inactif: 'bg-red-100 text-red-800',
  }
  return styles[status] || 'bg-gray-100 text-gray-800'
}

const DetailCard = ({ label, value, children }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <div className="mt-1 text-lg font-semibold text-gray-900">{children || value || 'N/A'}</div>
  </div>
)

export default function BTSDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bts, setBts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const btsRes = await api.get(`/bts/${id}`)
        setBts(btsRes.data.data || btsRes.data)
      } catch (err) {
        console.error(err)
        setError('Impossible de charger les détails de la BTS.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 rounded bg-gray-200 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-24 rounded-lg bg-gray-200"></div>
            <div className="h-24 rounded-lg bg-gray-200"></div>
            <div className="h-24 rounded-lg bg-gray-200"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !bts) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'BTS introuvable.'}</p>
        <button
          onClick={() => navigate('/bts')}
          className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Retour à la liste
        </button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{bts.nom}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {bts.code} — {bts.localisation}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/bts/edit/${id}`}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Modifier
          </Link>
          <Link
            to="/bts/releves"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Historique des relevés
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DetailCard label="Code" value={bts.code} />
        <DetailCard label="Statut">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadge(bts.statut)}`}>
            {bts.statut}
          </span>
        </DetailCard>
        <DetailCard label="Partenaire" value={bts.partenaire?.nom} />
        <DetailCard label="Localisation" value={bts.localisation} />
        <DetailCard label="Coordonnées">
          <span className="text-sm">Lat: {bts.latitude || 'N/A'}, Long: {bts.longitude || 'N/A'}</span>
        </DetailCard>
        <DetailCard label="Date d'installation" value={bts.date_installation} />
        <div className="md:col-span-2 lg:col-span-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <SaturationGauge percentage={bts.saturation || 0} />
        </div>
      </div>
    </div>
  )
}
