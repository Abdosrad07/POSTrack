import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import CarteBTS from '../../components/BTS/CarteBTS'
import BTSInfoPanel from '../../components/BTS/BTSInfoPanel'
import Logo from '../../assets/logos/LOGO.jpeg'
import { getMockBtsForRole, mockBts } from '../../mocks/bts'
import { STORAGE_KEYS } from '../../utils/constants'
import btsDebug from '../../utils/btsDebug'

const getSaturationColor = (saturation) => {
  if (saturation > 80) return 'bg-red-500'
  if (saturation > 50) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getStatusStyle = (status) => {
  const normalized = (status || '').toUpperCase()
  const styles = {
    ACTIF: 'bg-green-100 text-green-800',
    MAINTENANCE: 'bg-yellow-100 text-yellow-800',
    HORS_SERVICE: 'bg-red-100 text-red-800',
  }
  return styles[normalized] || 'bg-gray-100 text-gray-800'
}

const STATUS_LABEL = {
  ACTIF: 'Actif',
  MAINTENANCE: 'Maintenance',
  HORS_SERVICE: 'Hors service',
}

const normalizeBts = (b) => ({
  ...b,
  code: b.code || b.code_bts,
  localisation: b.localisation || b.ville,
  saturation: b.saturation ?? b.dernier_taux_saturation ?? 0,
  statut: (b.statut || 'ACTIF').toUpperCase(),
  latitude: b.latitude ?? b.lat,
  longitude: b.longitude ?? b.lng,
  lieux_couverts: b.lieux_couverts || (b.ville ? [b.ville] : []),
})

export default function BTSListPage() {
  const [btsList, setBtsList] = useState([])
  const [selectedBts, setSelectedBts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      return null
    }
  })()

  const fetchBts = async () => {
    try {
      setLoading(true)
      setError(null)
      const partnerId = localStorage.getItem(STORAGE_KEYS.PARTNER_CONTEXT_ID)
      btsDebug.log('BTSListPage fetch', { partnerId, userRole: user?.role })
      let response
      try {
        const url = partnerId ? `/api/partners/${partnerId}/bts` : '/bts'
        btsDebug.log('BTSListPage request URL', url)
        response = await api.get(url, { skipPartnerPrefix: true })
      } catch (nestedError) {
        if (nestedError.response?.status === 404 || nestedError.response?.status === 422) {
          btsDebug.warn('BTSListPage fallback /bts', nestedError.response?.status)
          response = await api.get('/bts', { skipPartnerPrefix: true })
        } else {
          throw nestedError
        }
      }
      const raw = response.data.data || response.data || []
      btsDebug.snapshot('BTSListPage response shape', { isArray: Array.isArray(raw), length: raw.length, first: raw[0] })
      const normalized = raw.map(normalizeBts)
      setBtsList(normalized)
      if (!raw.length) {
        btsDebug.warn('BTSListPage backend returned empty list, fallback mock')
        setBtsList((getMockBtsForRole(user?.role) || mockBts).map(normalizeBts))
      }
    } catch (err) {
      setError('Erreur lors de la récupération des BTS.')
      btsDebug.error('BTSListPage error', err?.response?.status, err?.response?.data || err.message)
      setBtsList((getMockBtsForRole(user?.role) || mockBts).map(normalizeBts))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBts()
  }, [])

  const filteredBts = btsList.filter((b) => {
    const matchesSearch =
      b.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.localisation?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter ? b.statut === statusFilter : true
    return matchesSearch && matchesStatus
  })
return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des BTS</h1>
          <p className="mt-1 text-sm text-gray-600">Suivi des stations de base et de leur saturation en temps réel.</p>
        </div>
        <Link
          to="/import-export"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Importer des BTS (Excel)
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une BTS..."
          className="flex-1 min-w-48 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Tous les statuts</option>
          <option value="ACTIF">Actif</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="HORS_SERVICE">Hors service</option>
        </select>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Liste des BTS</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Code / Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Localisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Partenaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Saturation</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-red-600">{error}</td>
                </tr>
              ) : filteredBts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    Aucune BTS ne correspond à vos critères.
                  </td>
                </tr>
              ) : (
                filteredBts.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedBts(b)}
                    className={`cursor-pointer transition-colors ${selectedBts?.id === b.id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      <div>{b.nom}</div>
                      <div className="text-xs text-gray-500">{b.code}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{b.localisation}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{b.partenaire || 'N/A'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${getSaturationColor(b.saturation)}`}
                            style={{ width: `${b.saturation}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold">{b.saturation}%</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusStyle(b.statut)}`}>
                        {STATUS_LABEL[b.statut] || b.statut}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <Link
                        to={`/bts/${b.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Détails
                      </Link>
                      <Link
                        to={`/bts/releves`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Relevés
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Carte des BTS */}
        <div className="lg:col-span-2">
          <h2 className="mb-2 text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Carte de couverture</h2>
          {filteredBts.length > 0 ? (
            <CarteBTS
              btsList={filteredBts}
              selectedId={selectedBts?.id}
              onSelect={(b) => setSelectedBts(b)}
            />
          ) : (
            <div className="flex h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center sm:h-[420px] lg:h-[520px]">
              <img
                src={Logo}
                alt="POSTrack logo"
                className="mb-4 h-16 w-auto"
              />
              <p className="text-sm text-gray-500">Aucune BTS disponible pour l'affichage carte</p>
            </div>
          )}
        </div>

        {/* BTS Info Panel */}
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Détails BTS</h2>
          <BTSInfoPanel bts={selectedBts} />
        </div>
      </div>
    </div>
  )
}