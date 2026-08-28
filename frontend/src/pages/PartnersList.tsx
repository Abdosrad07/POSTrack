import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/outline'
import partenaireService from '../services/partenaireService'
import ExportButtons from '../components/Common/ExportButtons/ExportButtons'

type Partenaire = {
  id: number
  code: string | null
  nom: string
  adresse: string | null
  responsable: string | null
  responsable_contact: string | null
  responsable_user_id: number | null
  commercial: string | null
  commercial_contact: string | null
  commercial_user_id: number | null
  master_sim_number: string | null
  contract_start_date: string | Date | null
  created_at: string | null
  pos_count: number
  statut: 'actif' | 'inactif' | string
}

type PartenairePayload = {
  id?: number
  name?: string
  nom?: string
  code?: string
  address?: string | null
  adresse?: string | null
  is_active?: boolean
  responsable_name?: string | null
  responsable_contact?: string | null
  responsable_user_id?: number | null
  commercial_name?: string | null
  commercial_contact?: string | null
  commercial_user_id?: number | null
  master_sim_number?: string | null
  contract_start_date?: string | Date | null
  created_at?: string
  pos_count?: number | null
}

const EXPORT_COLUMNS = [
  { label: 'Code', value: 'code' },
  { label: 'Nom', value: 'nom' },
  { label: 'Adresse', value: 'adresse' },
  { label: 'Responsable', value: 'responsable' },
  { label: 'ID responsable', value: 'responsable_user_id' },
  { label: 'Contact responsable', value: 'responsable_contact' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'ID commercial', value: 'commercial_user_id' },
  { label: 'Contact commercial', value: 'commercial_contact' },
  { label: 'MasterSIM', value: 'master_sim_number' },
  {
    label: 'Début du contrat',
    value: (p: Partenaire) =>
      p.contract_start_date ? new Date(p.contract_start_date).toLocaleDateString('fr-FR') : '',
  },
  { label: 'Nombre de POS', value: 'pos_count' },
  { label: 'Statut', value: 'statut' },
]

export default function PartenairesListPage() {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let ignore = false

    const fetchPartenaires = async () => {
      try {
        setLoading(true)
        const response = await partenaireService.getAll({ limit: 500 })
        const raw = response.data?.items || response.data?.data || response.data || []
        const list = Array.isArray(raw) ? (raw as PartenairePayload[]) : []
        const data = list
          .filter((p): p is PartenairePayload & { id: number } => !!p && typeof p.id === 'number')
          .map((p) => ({
            id: p.id,
            code: p.code ?? null,
            nom: p.nom || p.name || `Partenaire #${p.id}`,
            adresse: p.adresse ?? p.address ?? null,
            responsable: p.responsable_name ?? null,
            responsable_contact: p.responsable_contact ?? null,
            responsable_user_id: p.responsable_user_id ?? null,
            commercial: p.commercial_name ?? null,
            commercial_contact: p.commercial_contact ?? null,
            commercial_user_id: p.commercial_user_id ?? null,
            master_sim_number: p.master_sim_number ?? null,
            contract_start_date: p.contract_start_date ?? null,
            created_at: p.created_at ?? null,
            pos_count: p.pos_count ?? 0,
            statut: p.is_active === false ? ('inactif' as const) : ('actif' as const),
          }))
        if (!ignore) {
          setPartenaires(data)
        }
      } catch (err) {
        if (!ignore) {
          const apiError = err as {
            response?: { data?: { detail?: string } }
            message?: string
          }
          setError(
            apiError?.response?.data?.detail ||
              apiError?.message ||
              'Impossible de charger les partenaires.'
          )
          setPartenaires([])
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void fetchPartenaires()

    return () => {
      ignore = true
    }
  }, [])

  const toSafeLower = (value: unknown) =>
    typeof value === 'string' ? value.toLowerCase() : String(value ?? '').toLowerCase()

  const filteredPartenaires = useMemo(
    () =>
      partenaires.filter((p: Partenaire) => {
        const needle = toSafeLower(searchTerm)
        const matchesSearch =
          toSafeLower(p.nom).includes(needle) ||
          toSafeLower(p.code).includes(needle) ||
          toSafeLower(p.responsable).includes(needle) ||
          toSafeLower(p.commercial).includes(needle)
        const matchesStatus = statusFilter ? p.statut === statusFilter : true
        return matchesSearch && matchesStatus
      }),
    [partenaires, searchTerm, statusFilter]
  )

  const tdBase = 'whitespace-nowrap px-4 py-3 text-sm text-slate-500'

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="animate-fade-in flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Gestion des Partenaires</h1>
          <p className="mt-1 text-sm text-slate-500">
            Identité, encadrement (responsable / commercial), contrats et portefeuille POS.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/partenaires/new')}
          className="btn btn-primary"
        >
          + Nouveau Partenaire
        </button>
      </div>

      {/* Filters */}
      <div className="card animate-fade-in stagger-1">
        <div className="card-body flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher (nom, code, responsable, commercial...)"
              className="input pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select w-auto"
          >
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error ? (
        <div className="rounded-xl border border-red-200/60 bg-red-50/50 px-5 py-4 text-sm font-medium text-red-700 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
              <XCircleIcon className="h-5 w-5 text-red-600" aria-hidden="true" />
            </span>
            {error}
          </div>
        </div>
      ) : null}

      {/* Table */}
      <div className="card overflow-hidden animate-fade-in stagger-2">
        <div className="card-header flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-semibold text-slate-700">
            {loading ? 'Chargement…' : `${filteredPartenaires.length} partenaire(s)`}
          </span>
          <ExportButtons
            rows={filteredPartenaires}
            columns={EXPORT_COLUMNS}
            fileName="partenaires"
            title="Gestion des Partenaires"
            disabled={loading}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/80">
              <tr>
                {['Code', 'Nom', 'Adresse', 'Responsable', 'ID resp.', 'Tél. responsable',
                  'Commercial', 'ID comm.', 'Tél. commercial', 'MasterSIM', 'Début du contrat',
                  'POS', 'Statut', 'Créé le', 'Actions'].map((label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={15} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      <span className="text-sm text-slate-400">Chargement…</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPartenaires.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-6 py-10 text-center text-sm text-slate-400">
                    Aucun partenaire enregistré pour le moment
                  </td>
                </tr>
              ) : (
                filteredPartenaires.map((p) => (
                  <tr key={p.id} className="table-row-hover">
                    <td className={`${tdBase} font-semibold text-brand-600`}>{p.code || '—'}</td>
                    <td className={`${tdBase} font-semibold text-slate-900`}>{p.nom}</td>
                    <td className={tdBase}>{p.adresse || '—'}</td>
                    <td className={tdBase}>{p.responsable || 'Non renseigné'}</td>
                    <td className={tdBase}>
                      {p.responsable_user_id != null ? `#${p.responsable_user_id}` : '—'}
                    </td>
                    <td className={tdBase}>{p.responsable_contact || '—'}</td>
                    <td className={tdBase}>{p.commercial || 'Non renseigné'}</td>
                    <td className={tdBase}>
                      {p.commercial_user_id != null ? `#${p.commercial_user_id}` : '—'}
                    </td>
                    <td className={tdBase}>{p.commercial_contact || '—'}</td>
                    <td className={tdBase}>{p.master_sim_number || '—'}</td>
                    <td className={tdBase}>
                      {p.contract_start_date
                        ? new Date(p.contract_start_date).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className={`${tdBase} font-semibold`}>{p.pos_count}</td>
                    <td className={tdBase}>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          p.statut === 'actif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          p.statut === 'actif' ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                        {p.statut}
                      </span>
                    </td>
                    <td className={tdBase}>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <button
                        type="button"
                        onClick={() => navigate('/partenaires/new')}
                        className="font-medium text-brand-600 transition-colors hover:text-brand-800"
                      >
                        Modifier
                      </button>
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
