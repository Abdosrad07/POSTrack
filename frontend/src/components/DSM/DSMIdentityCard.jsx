const Field = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value ?? 'Non renseigné'}</span>
  </div>
)

export default function DSMIdentityCard({ dsm }) {
  if (!dsm) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Carte d'identité DSM</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">{dsm.full_name || dsm.nom || 'Non renseigné'}</h2>
        <p className="text-sm text-slate-500">{dsm.matricule || 'Non renseigné'}</p>
      </div>
      <div className="px-5">
        <Field label="Code DSM" value={dsm.matricule} />
        <Field label="Nom du responsable" value={dsm.full_name || dsm.nom} />
        <Field label="Contact" value={dsm.telephone || dsm.phone || dsm.contact} />
        <Field label="Partenaire" value={dsm.partner_name || dsm.partner?.name || dsm.partner} />
        <Field label="Micro-zone" value={dsm.micro_zone || dsm.zone} />
        <Field label="POS créés" value={dsm.nb_pos_crees} />
      </div>
    </div>
  )
}