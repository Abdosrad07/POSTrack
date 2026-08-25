import { useState, useEffect, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import SaturationGauge from '../../components/BTS/SaturationGauge'
import CarteBTS from '../../components/BTS/CarteBTS'
import BTSInfoPanel from '../../components/BTS/BTSInfoPanel'
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
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <div className="mt-1 text-lg font-semibold text-slate-900">{children || value || '—'}</div>
  </div>
)

const normalizeBts = (b) => ({
  ...b,
  code: b.code || b.code_bts,
  localisation: b.localisation || b.ville,
  statut: (b.statut || 'ACTIF').toUpperCase(),
  latitude: b.latitude ?? b.lat,
  longitude: b.longitude ?? b.lng,
  lieux_couverts: b.lieux_couverts || (b.quartier || b.ville ? [b.quartier || b.ville] : []),
  quartier: b.quartier || b.zone || null,
  micro_zone: b.micro_zone || null,
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
          api.get('/bts'),
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
        setBts(null)
        setBtsList([])
        setSelectedBts(null)
        setError(err?.apiMessage || 'Impossible de charger les détails de la BTS.')
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
      <div className="py-12 text-center">
        <p className="text-slate-700">{error || 'BTS introuvable.'}</p>
        <button
          onClick={() => navigate('/bts')}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          Retour à la liste
        </button>
      </div>
    )
  }

  const current = selectedBts || normalizeBts(bts)
  const mapList = useMemo(
    () => (current ? [current, ...btsList.filter((item) => item.id !== current.id)] : btsList),
    [current, btsList]
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{bts.nom}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {bts.code_bts} — {bts.localisation}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/bts/${id}/modifier`}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            Modifier
          </Link>
          <Link
            to="/bts/releves"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
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
        <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
          <SaturationGauge value={bts.dernier_taux_saturation || 0} />
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-900">Couverture géographique</h2>
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

