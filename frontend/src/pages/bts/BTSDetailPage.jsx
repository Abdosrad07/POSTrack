import { useState, useEffect, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import SaturationGauge from '../../components/BTS/SaturationGauge'
import CarteBTS from '../../components/BTS/CarteBTS'
import BTSInfoPanel from '../../components/BTS/BTSInfoPanel'
import { getMockBtsForRole } from '../../mocks/bts'
import { STORAGE_KEYS } from '../../utils/constants'
import btsDebug from '../../utils/btsDebug'

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

const normalizeBts = (b) => ({
  ...b,
  code: b.code || b.code_bts,
  localisation: b.localisation || b.ville,
  statut: (b.statut || 'ACTIF').toUpperCase(),
  latitude: b.latitude ?? b.lat,
  longitude: b.longitude ?? b.lng,
  lieux_couverts: b.lieux_couverts || (b.ville ? [b.ville] : []),
})

export default function BTSDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bts, setBts] = useState(null)
  const [btsList, setBtsList] = useState([])
  const [selectedBts, setSelectedBts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      return null
    }
  })()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const partnerId = localStorage.getItem(STORAGE_KEYS.PARTNER_CONTEXT_ID)
        btsDebug.log('BTSDetailPage fetch', { id, partnerId, userRole: user?.role })
        const [detailRes, listRes] = await Promise.all([
          api.get(`/bts/${id}`),
          partnerId ? api.get(`/api/partners/${partnerId}/bts`, { skipPartnerPrefix: true }) : api.get('/bts'),
        ])
        const detail = detailRes.data.data || detailRes.data
        const list = listRes.data.data || listRes.data || []
        btsDebug.snapshot('BTSDetailPage detail response', detail)
        btsDebug.snapshot('BTSDetailPage list response', { isArray: Array.isArray(list), length: list.length, first: list[0] })
        setBts(detail)
        setBtsList(list.map(normalizeBts))
        setSelectedBts(detail ? normalizeBts(detail) : null)
      } catch (err) {
        btsDebug.error('BTSDetailPage error', err?.response?.status, err?.response?.data || err.message)
        const fallbackList = getMockBtsForRole(user?.role)
        const fallbackDetail = fallbackList.find((item) => String(item.id) === String(id)) || fallbackList[0]
        if (fallbackDetail) {
          btsDebug.warn('BTSDetailPage fallback mock used', fallbackDetail)
          setBts(fallbackDetail)
          setBtsList(fallbackList)
          setSelectedBts(fallbackDetail)
          setError(null)
        } else {
          setError('Impossible de charger les détails de la BTS.')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const mapList = useMemo(
    () => (selectedBts ? [selectedBts, ...btsList.filter((b) => b.id !== selectedBts.id)] : btsList),
    [selectedBts, btsList]
  )

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

  const current = selectedBts || normalizeBts(bts)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{bts.nom}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {bts.code_bts} — {bts.localisation}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/bts/${id}/modifier`}
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
        <DetailCard label="Code" value={bts.code_bts} />
        <DetailCard label="Statut">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadge((bts.statut || 'ACTIF').toLowerCase())}`}>
            {bts.statut}
          </span>
        </DetailCard>
        <DetailCard label="Opérateur" value={bts.operateur} />
        <DetailCard label="Ville" value={bts.ville} />
        <DetailCard label="Coordonnées">
          <span className="text-sm">Lat: {bts.latitude || 'N/A'}, Long: {bts.longitude || 'N/A'}</span>
        </DetailCard>
        <DetailCard label="Date de mise en service" value={bts.date_mise_service} />
        <div className="md:col-span-2 lg:col-span-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <SaturationGauge value={bts.dernier_taux_saturation || 0} />
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900">Couverture géographique</h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CarteBTS
            btsList={mapList}
            selectedId={current?.id}
            onSelect={(b) => setSelectedBts(normalizeBts(b))}
          />
        </div>
        <div>
          <BTSInfoPanel bts={current} />
        </div>
      </div>
    </div>
  )
}

