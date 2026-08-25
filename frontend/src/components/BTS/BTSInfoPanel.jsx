import { useMemo } from 'react'

/**
 * Panneau d'informations d'une BTS — Module A4 (Lead Frontend).
 *
 * Affiche la fiche détaillée de la BTS sélectionnée et les lieux/quartiers qu'elle
 * couvre. Les lieux couverts proviennent de `bts.lieux_couverts` (liste de chaînes)
 * ou sont dérivés de la ville/région si aucune liste n'est fournie.
 */
const STATUS_STYLE = {
  ACTIF: 'bg-green-100 text-green-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  HORS_SERVICE: 'bg-red-100 text-red-800',
}

const Field = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value ?? 'Non renseigné'}</span>
  </div>
)

export default function BTSInfoPanel({ bts }) {
  const lieuxCouverts = useMemo(() => {
    if (bts?.lieux_couverts?.length) return bts.lieux_couverts
    // Déduction par défaut quand la liste n'est pas renseignée
    const base = []
    if (bts?.ville) base.push(`Centre de ${bts.ville}`)
    if (bts?.region) base.push(`Commune de ${bts.region}`)
    return base.length ? base : []
  }, [bts])

  if (!bts) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
        Sélectionnez une BTS sur la carte pour afficher ses informations et ses lieux de couverture.
      </div>
    )
  }

  const statut = bts.statut || 'ACTIF'
  const labelStatut = STATUS_STYLE[statut] ? statut : 'ACTIF'

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{bts.nom || bts.code_bts}</h3>
          <p className="text-xs text-gray-500">{bts.code_bts}</p>
        </div>
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[labelStatut] || 'bg-gray-100 text-gray-800'}`}>
          {bts.statut || 'ACTIF'}
        </span>
      </div>

      <div className="px-4">
        <Field label="Code" value={bts.code_bts} />
        <Field label="Opérateur" value={bts.operateur} />
        <Field label="Technologie" value={bts.technologie} />
        <Field label="Ville" value={bts.ville} />
        <Field label="Région" value={bts.region} />
        <Field label="Quartier" value={bts.quartier} />
        <Field label="Micro-zone" value={bts.micro_zone} />
        <Field label="Capacité max" value={bts.capacite_max != null ? `${bts.capacite_max}` : null} />
        <Field
          label="Saturation"
          value={bts.saturation != null ? `${bts.saturation}%` : null}
        />
        <Field label="Coordonnées" value={bts.latitude != null && bts.longitude != null ? `${bts.latitude}, ${bts.longitude}` : null} />
      </div>

      <div className="border-t border-gray-200 px-4 py-3">
        <h4 className="mb-2 text-sm font-semibold text-gray-700">Lieux couverts</h4>
        {lieuxCouverts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {lieuxCouverts.map((lieu, i) => (
              <span key={i} className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                {lieu}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Aucun lieu couvert renseigné.</p>
        )}
      </div>
    </div>
  )
}
