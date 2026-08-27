import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import partenaireService from '../services/partenaireService'
import ExportButtons from '../components/Common/ExportButtons/ExportButtons'

/**
 * Onglet « Partenaires » de la sidebar (ADMIN).
 *
 * Le tableau présente TOUTES les données renvoyées par GET /api/partenaires
 * (PartnerOut) : identité, responsable, commercial (nom / contact / ID),
 * MasterSIM, contrat, compteur POS et statut. La barre d'export permet de
 * télécharger ces données en PDF, Excel ou JSON.
 */

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

/** Forme brute renvoyée par l'API (PartnerOut FastAPI). */
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

/** Colonnes affichées — même descriptif pour l'affichage et l'export. */
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
          // Source de vérité unique : erreur affichée, aucun référentiel simulé.
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

  const tdBase = 'whitespace-nowrap px-4 py-3 text-sm text-gray-500'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Partenaires</h1>
          <p className="mt-1 text-sm text-gray-600">
            Identité, encadrement (responsable / commercial), contrats et portefeuille POS.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/partenaires/new')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          + Nouveau Partenaire
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher (nom, code, responsable, commercial...)"
          className="flex-1 min-w-48 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
        </select>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Tableau des partenaires — toutes les colonnes renseignées */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <span className="text-sm font-semibold text-gray-900">
            {filteredPartenaires.length} partenaire(s) affiché(s)
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Code', 'Nom', 'Adresse', 'Responsable', 'ID resp.', 'Tél. responsable',
                  'Commercial', 'ID comm.', 'Tél. commercial', 'MasterSIM', 'Début du contrat',
                  'Nombre de POS', 'Statut', 'Créé le'].map((label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {label}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={15} className="px-6 py-8 text-center text-sm text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : filteredPartenaires.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-6 py-8 text-center text-sm text-gray-500">
                    Aucun partenaire enregistré pour le moment
                  </td>
                </tr>
              ) : (
                filteredPartenaires.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className={`${tdBase} font-medium text-gray-900`}>{p.code || '—'}</td>
                    <td className={`${tdBase} font-medium text-gray-900`}>{p.nom}</td>
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
                    <td className={`${tdBase} font-medium`}>{p.pos_count}</td>
                    <td className={tdBase}>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${
                          p.statut === 'actif'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {p.statut}
                      </span>
                    </td>
                    <td className={tdBase}>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => navigate('/partenaires/new')}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Modifier / Créer
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
