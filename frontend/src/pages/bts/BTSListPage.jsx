import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CarteBTS from '../../components/BTS/CarteBTS'
import BTSInfoPanel from '../../components/BTS/BTSInfoPanel'
import Logo from '../../assets/logos/LOGO.jpeg'
import btsDebug from '../../utils/btsDebug'
import { STORAGE_KEYS } from '../../utils/constants'
import api from '../../services/api';
import ExportButtons from '../../components/Common/ExportButtons/ExportButtons';

const BTS_IMPORT_STORAGE_KEY = 'bts_internal_import_ref';

/**
 * Lien cartographique présentant TOUTES les BTS filtrées :
 * mode itinéraire avec la 1re BTS en destination et jusqu'à 9
 * waypoints (limite de l'API URL Maps).
 */
const buildAllBtsUrl = (btsList) => {
  const points = btsList
    .filter((b) => Number.isFinite(parseFloat(b.latitude)) && Number.isFinite(parseFloat(b.longitude)))
    .slice(0, 10)
    .map((b) => `${parseFloat(b.latitude)},${parseFloat(b.longitude)}`)
  if (points.length === 0) return null
  const [destination, ...waypoints] = points
  const params = new URLSearchParams({ api: '1', destination })
  if (waypoints.length > 0) params.set('waypoints', waypoints.join('|'))
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

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

/** Colonnes du tableau / export BTS — alignées sur BTSOut (backend). */
const EXPORT_COLUMNS = [
  { label: 'Code', value: 'code' },
  { label: 'Nom', value: 'nom' },
  { label: 'Localisation', value: 'localisation' },
  { label: 'Quartier', value: 'quartier' },
  { label: 'Micro-zone', value: 'micro_zone' },
  { label: 'Partenaire', value: 'partenaire' },
  { label: 'Saturation (%)', value: 'saturation' },
  { label: 'Statut', value: (b) => STATUS_LABEL[b.statut?.toUpperCase()] ?? b.statut ?? '—' },
  { label: 'Latitude', value: 'latitude' },
  { label: 'Longitude', value: 'longitude' },
];

const STATUS_LABEL = {
  ACTIF: 'Actif',
  MAINTENANCE: 'Maintenance',
  HORS_SERVICE: 'Hors service',
}

const normalizeBts = (b) => ({
  ...b,
  code: b.code || b.code_bts,
  localisation: b.localisation || b.ville || b.zone,
  saturation: b.saturation ?? b.dernier_taux_saturation ?? b.derniere_saturation ?? 0,
  statut: (b.statut || 'ACTIF').toUpperCase(),
  latitude: b.latitude ?? b.lat,
  longitude: b.longitude ?? b.lng,
  lieux_couverts: b.lieux_couverts || [b.quartier || b.ville || b.zone].filter(Boolean),
  quartier: b.quartier || b.zone || null,
  micro_zone: b.micro_zone || null,
})

export default function BTSListPage() {
  const [btsList, setBtsList] = useState([])
  const [selectedBts, setSelectedBts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [gmapsUrl, setGmapsUrl] = useState(() => {
    try { return localStorage.getItem(BTS_IMPORT_STORAGE_KEY) || '' } catch { return '' }
  })

  const persistGmapsUrl = (value) => {
    setGmapsUrl(value)
    try {
      if (value.trim()) localStorage.setItem(BTS_IMPORT_STORAGE_KEY, value)
      else localStorage.removeItem(BTS_IMPORT_STORAGE_KEY)
    } catch { /* stockage indisponible : on ignore */ }
  }

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
      if (!partnerId) {
        setError('Aucun partenaire sélectionné. Choisissez un contexte partenaire avant de charger les BTS.')
        setBtsList([])
        return
      }
      btsDebug.log('BTSListPage fetch', { partnerId, userRole: user?.role })
      const response = await api.get('/bts')
      const payload = response.data ?? {}
      const raw = Array.isArray(payload) ? payload : payload.items ?? payload.data ?? []
      btsDebug.snapshot('BTSListPage response shape', { isArray: Array.isArray(raw), length: raw.length, first: raw[0] })
      setBtsList(raw.map(normalizeBts))
      } catch (err) {
      if (err?.code === 'NO_PARTNER_CONTEXT') {
        setError('Aucun partenaire sélectionné. Choisissez un contexte partenaire avant de charger les BTS.')
      } else {
        setError(err?.apiMessage || err?.message || 'Erreur lors de la récupération des BTS.')
      }
      btsDebug.error('BTSListPage error', err?.response?.status, err?.response?.data || err.message)
      setBtsList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBts()
    try {
      const stored = localStorage.getItem(GMAPS_STORAGE_KEY)
      if (stored) setGmapsUrl(stored)
    } catch {
      // ignore
    }
  }, [])

  const filteredBts = useMemo(() => {
    const needle = searchTerm.toLowerCase().trim()
    return btsList.filter((b) => {
      const matchesSearch =
        !needle ||
        b.code?.toLowerCase().includes(needle) ||
        b.nom?.toLowerCase().includes(needle) ||
        b.localisation?.toLowerCase().includes(needle)
      const matchesStatus = statusFilter ? b.statut === statusFilter : true
      return matchesSearch && matchesStatus
    })
  }, [btsList, searchTerm, statusFilter])

  useEffect(() => {
    if (selectedBts && !filteredBts.some((b) => b.id === selectedBts.id)) {
      setSelectedBts(filteredBts[0] || null)
    }
  }, [filteredBts, selectedBts])

  if (loading) {
    return <div className="py-12 text-center text-slate-500">Chargement des BTS...</div>
  }

  if (error) {
    return <div className="py-12 text-center text-red-600">{error}</div>
  }

  const totalFiltered = filteredBts.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Gestion des BTS</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Suivi des stations de base et de leur saturation en temps réel.</p>
        </div>
      </div>

      <form
        className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Recherche</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nom, code, localisation..."
            className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Statut</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-44 rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Tous</option>
            {Object.keys(STATUS_LABEL).map((status) => (
              <option key={status} value={status}>{STATUS_LABEL[status]}</option>
            ))}
          </select>
        </div>
      </form>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Carte de couverture</h2>
          <span className="text-sm text-slate-500">{totalFiltered} marqueur(s)</span>
        </div>

        {/* Import BTS — fichier interne sécurisé stocké côté plateforme */}
        <div className="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">
                Référence du fichier interne BTS (confidentiel)
              </label>
              <input
                type="url"
                value={gmapsUrl}
                onChange={(e) => persistGmapsUrl(e.target.value)}
                placeholder="/storage/bts_imports/partner_1/import.kml"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            {(() => {
              const autoUrl = buildAllBtsUrl(filteredBts)
              const href = gmapsUrl?.trim() || autoUrl
              return (
                <a
                  href={href || undefined}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={!href}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${
                    href
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'pointer-events-none bg-slate-200 text-slate-400'
                  }`}
                >
                  Ouvrir toutes les BTS dans le planificateur cartographique
                </a>
              )
            })()}
          </div>
          <p className="text-xs text-slate-500">
            Le lien est stocké localement dans la plateforme pour préparation future.
            Aucun point BTS n’est extrait ni affiché depuis ce lien.
          </p>
        </div>

        {totalFiltered > 0 ? (
          <CarteBTS
            btsList={filteredBts}
            selectedId={selectedBts?.id}
            onSelect={(b) => setSelectedBts(b)}
          />
        ) : (
          <div className="flex h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center sm:h-[420px] lg:h-[520px]">
            <img src={Logo} alt="POSTrack logo" className="mb-4 h-16 w-auto" />
            <p className="text-sm text-slate-500">Aucune BTS disponible pour l'affichage carte.</p>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Tableau de saturation</h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-slate-500">{totalFiltered} résultat(s)</span>
              <ExportButtons
                rows={filteredBts}
                columns={EXPORT_COLUMNS}
                fileName="bts"
                title="BTS - Saturation"
                disabled={loading}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Localisation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Partenaire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Saturation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredBts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-sm text-slate-500">
                      Aucune BTS ne correspond aux filtres actifs.
                    </td>
                  </tr>
                ) : (
                  filteredBts.map((b) => (
                    <tr
                      key={b.id}
                      className={`cursor-pointer transition hover:bg-slate-50 ${selectedBts?.id === b.id ? 'bg-slate-50' : ''}`}
                      onClick={() => setSelectedBts(b)}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                        <div>{b.nom}</div>
                        <div className="text-xs text-slate-500">{b.code}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{b.localisation}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{b.partenaire || '—'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-24 rounded-full bg-slate-200">
                            <div
                              className={`h-2.5 rounded-full ${getSaturationColor(b.saturation)}`}
                              style={{ width: `${Math.max(0, Math.min(100, b.saturation))}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold">{b.saturation}%</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold leading-5 ${getStatusStyle(b.statut)}`}>
                          {STATUS_LABEL[b.statut] || b.statut}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <Link to={`/bts/${b.id}`} onClick={(e) => e.stopPropagation()} className="mr-3 text-slate-700 transition hover:text-slate-950">
                          Détails
                        </Link>
                        <Link to="/bts/releves" onClick={(e) => e.stopPropagation()} className="text-slate-600 transition hover:text-slate-900">
                          Relevés
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-2 border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900">Détails BTS</h2>
          <BTSInfoPanel bts={selectedBts} />
        </section>
      </div>
    </div>
  )
}