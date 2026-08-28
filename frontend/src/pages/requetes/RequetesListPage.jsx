import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/Common/PageHeader/PageHeader'
import DataTable from '../../components/Common/DataTable/DataTable'
import StatusPill from '../../components/Common/StatusPill/StatusPill'
import ExportButtons from '../../components/Common/ExportButtons/ExportButtons'
import requeteService from '../../services/requeteService'
import dsmService from '../../services/dsmService'
import { ENTITES_EN_CHARGE } from '../../utils/constants'

const EXPORT_COLUMNS = [
  {
    label: 'Date d\'ouverture',
    value: (r) => (r.date_creation ? new Date(r.date_creation).toLocaleDateString('fr-FR') : ''),
  },
  { label: 'Titre / Cas', value: (r) => r.titre ?? r.cas ?? '' },
  { label: 'Demandeur', value: 'demandeur_name' },
  { label: 'DSM demandeur', value: 'dsm_name' },
  { label: 'Type', value: (r) => TYPE_LABELS[r.type_requete] ?? r.type_requete ?? '' },
  {
    label: 'Statut',
    value: (r) =>
      r.statut ??
      (r.nombre_effectue + r.nombre_rejete >= r.nombre_demande && r.nombre_demande > 0
        ? 'Terminée'
        : 'En cours'),
  },
  { label: 'Entité en charge', value: 'entite_en_charge' },
  { label: 'Délai (jours)', value: 'delai' },
  { label: 'Nombre demandé', value: 'nombre_demande' },
  { label: 'Nombre effectué', value: 'nombre_effectue' },
  { label: 'Nombre rejeté', value: 'nombre_rejete' },
  { label: 'En retard', value: (r) => (r.en_retard ? 'Oui' : 'Non') },
  {
    label: 'Date de fin',
    value: (r) =>
      r.date_finalisation || r.closed_at
        ? new Date(r.date_finalisation || r.closed_at).toLocaleDateString('fr-FR')
        : '',
  },
]

const TYPE_LABELS = {
  AJOUT: 'Ajout',
  RECONDUCTION: 'Reconduction',
  DELINKAGE: 'Déliage',
  BASCULEMENT: 'Basculement',
  AUTRE: 'Autres',
}

const dayOf = (value) => (value ? String(value).slice(0, 10) : '')

const statutOf = (item) =>
  item.statut ||
  (item.nombre_effectue + item.nombre_rejete >= item.nombre_demande && item.nombre_demande > 0
    ? 'Terminée'
    : 'En cours')

const RequetesListPage = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [items, setItems] = useState([])
  const [dsms, setDsms] = useState([])
  const [filters, setFilters] = useState({
    type_requete: '',
    entite_en_charge: '',
    dsm_id: '',
    date_creation_from: '',
    date_creation_to: '',
    date_fin_from: '',
    date_fin_to: '',
  })

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { limit: 500 }
      if (filters.dsm_id) {
        params.dsm_id = filters.dsm_id
      }
      const response = await requeteService.list(params)
      setItems(response.data?.items ?? [])
    } catch (err) {
      setError(err?.apiMessage || err?.message || 'Impossible de charger les requêtes.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [filters.dsm_id])

  const fetchDSMs = useCallback(async () => {
    try {
      const response = await dsmService.getAll()
      const payload = response.data ?? {}
      const list = Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : []
      setDsms(list)
    } catch (err) {
      console.error('Impossible de charger les DSM:', err)
      setDsms([])
    }
  }, [])

  useEffect(() => {
    void fetchRequests()
    void fetchDSMs()
  }, [fetchRequests, fetchDSMs])

  const rows = useMemo(
    () =>
      items.filter((item) => {
        if (filters.type_requete && item.type_requete !== filters.type_requete) return false
        if (filters.entite_en_charge && (item.entite_en_charge || '') !== filters.entite_en_charge)
          return false
        if (filters.dsm_id && item.dsm_id != filters.dsm_id) return false
        const created = dayOf(item.date_creation)
        if (filters.date_creation_from && created < filters.date_creation_from) return false
        if (filters.date_creation_to && created > filters.date_creation_to) return false
        const fin = dayOf(item.date_finalisation || item.closed_at)
        if (filters.date_fin_from && fin < filters.date_fin_from) return false
        if (filters.date_fin_to && fin > filters.date_fin_to) return false
        return true
      }),
    [items, filters],
  )

  const entiteOptions = useMemo(() => {
    const present = items
      .map((i) => i.entite_en_charge)
      .filter(Boolean)
      .filter((v) => !ENTITES_EN_CHARGE.includes(v))
    return [...ENTITES_EN_CHARGE, ...Array.from(new Set(present)).sort()]
  }, [items])

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  /* __COLUMNS__ */
  const columns = [
    {
      key: 'titre',
      header: 'Titre / Cas',
      render: (item) => <span className="font-medium text-slate-900">{item.titre || '—'}</span>,
    },
    {
      key: 'created',
      header: "Date d'ouverture",
      sortValue: (item) => dayOf(item.date_creation),
      render: (item) => dayOf(item.date_creation) || '—',
    },
    { key: 'demandeur', header: 'Demandeur', render: (item) => item.demandeur_name || '—' },
    {
      key: 'dsm',
      header: 'DSM demandeur',
      responsive: 'hidden md:table-cell',
      render: (item) => item.dsm_name || '—',
    },
    {
      key: 'type',
      header: 'Type de requête',
      render: (item) => TYPE_LABELS[item.type_requete] ?? item.type_requete ?? '—',
    },
    {
      key: 'statut',
      header: 'Statut',
      render: (item) => (
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={statutOf(item)} />
          {item.en_retard && <StatusPill status="En retard" color="danger" size="sm" />}
        </div>
      ),
    },
    {
      key: 'entite',
      header: 'Entité en charge',
      responsive: 'hidden xl:table-cell',
      render: (item) => item.entite_en_charge || '—',
    },
    {
      key: 'delai',
      header: "Délai d'attente",
      render: (item) => (item.delai_attente != null ? `${item.delai_attente} jour(s)` : '—'),
    },
    {
      key: 'fin',
      header: 'Date de fin',
      render: (item) => dayOf(item.date_finalisation || item.closed_at) || '—',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Requêtes"
        subtitle="Suivi des demandes : ajout, reconduction, déliage, basculement."
        breadcrumbs={['Espace partenaire', 'Requêtes']}
      />

      {/* Filtres */}
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3 lg:grid-cols-6">
        <label className="flex flex-col gap-1">
          <span className="label">Type</span>
          <select
            className="select"
            value={filters.type_requete}
            onChange={(e) => updateFilter('type_requete', e.target.value)}
          >
            <option value="">Tous</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="label">DSM</span>
          <select
            className="select"
            value={filters.dsm_id}
            onChange={(e) => updateFilter('dsm_id', e.target.value)}
          >
            <option value="">Tous</option>
            {dsms.map((dsm) => (
              <option key={dsm.id} value={dsm.id}>
                {dsm.full_name || dsm.matricule || `DSM #${dsm.id}`}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="label">Entité en charge</span>
          <select
            className="select"
            value={filters.entite_en_charge}
            onChange={(e) => updateFilter('entite_en_charge', e.target.value)}
          >
            <option value="">Toutes</option>
            {entiteOptions.map((entite) => (
              <option key={entite} value={entite}>{entite}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="label">Créée du</span>
          <input
            type="date"
            className="input"
            value={filters.date_creation_from}
            onChange={(e) => updateFilter('date_creation_from', e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Créée au</span>
          <input
            type="date"
            className="input"
            value={filters.date_creation_to}
            onChange={(e) => updateFilter('date_creation_to', e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Fin du</span>
          <input
            type="date"
            className="input"
            value={filters.date_fin_from}
            onChange={(e) => updateFilter('date_fin_from', e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Fin au</span>
          <input
            type="date"
            className="input"
            value={filters.date_fin_to}
            onChange={(e) => updateFilter('date_fin_to', e.target.value)}
          />
        </label>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-semibold text-slate-700">
            {loading ? 'Chargement…' : `${rows.length} requête(s)`}
          </span>
          <ExportButtons
            rows={rows}
            columns={EXPORT_COLUMNS}
            fileName="requetes"
            title="Suivi des requêtes"
            disabled={loading}
          />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          error={error}
          onRetry={fetchRequests}
          rowKey="id"
          dense
          rowClassName={(item) => (item.en_retard ? 'bg-amber-50/60' : '')}
          emptyTitle="Aucune requête"
          emptyMessage="Aucune requête n'a encore été enregistrée pour ce partenaire."
        />
      </div>
    </div>
  )
}

export default RequetesListPage