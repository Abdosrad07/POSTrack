import { useMemo } from 'react'

/** Valeur affichée quand une information n'est pas disponible (règle étape 5). */
export const NOT_PROVIDED = 'Non renseigné'

/**
 * Renvoie la valeur si elle existe, sinon « Non renseigné ».
 * Une chaîne vide ou blanche est considérée comme non renseignée.
 */
export function displayValue(value) {
  if (value === null || value === undefined) return NOT_PROVIDED
  if (typeof value === 'string' && value.trim() === '') return NOT_PROVIDED
  return value
}

/**
 * Initiales dérivées du nom réel du partenaire (donnée backend) pour le
 * monogramme visuel — purement décoratif, aucune valeur métier inventée.
 */
function initials(name) {
  const parts = String(name ?? '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '—'
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

function formatDate(value) {
  if (!value) return NOT_PROVIDED
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return NOT_PROVIDED
  return d.toLocaleDateString('fr-FR')
}

/** Identifiant utilisateur : #id, complété du username si résolu côté backend. */
export function displayUserId(userId, username) {
  if (!userId && !username) return NOT_PROVIDED
  if (!userId) return NOT_PROVIDED
  return username ? `#${userId} (${username})` : `#${userId}`
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-slate-900">{value}</div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-700">{title}</div>
      <div className="grid gap-3 sm:grid-cols-3">{children}</div>
    </div>
  )
}

/**
 * Carte d'identité partenaire (étape 5) — composant réutilisable.
 *
 * Toutes les valeurs proviennent de GET /api/partenaires/{id}/identity
 * (backend) ; tout champ absent affiche « Non renseigné », jamais de
 * valeur inventée.
 *
 * @param {{ identity: object | null, loading?: boolean }} props
 */
export default function PartnerIdentityCard({ identity, loading = false }) {
  const monogram = useMemo(() => initials(identity?.name), [identity?.name])

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-busy="true">
        <div className="text-sm text-slate-500">Chargement de la fiche partenaire…</div>
      </div>
    )
  }

  const isActive = identity?.is_active

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* En-tête : logo (monogramme) / nom / code / statut */}
      <header className="flex flex-wrap items-center gap-4 border-b border-slate-200 bg-gradient-to-r from-sky-50 to-white px-4 py-4">
        <div
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-600 text-base font-bold text-white"
        >
          {monogram}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold text-slate-900">
            {displayValue(identity?.name)}
          </h2>
          <p className="text-sm text-slate-500">
            Code partenaire&nbsp;: <span className="font-mono font-medium text-slate-700">{displayValue(identity?.code)}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${
              isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {isActive === undefined || isActive === null ? NOT_PROVIDED : isActive ? 'ACTIF' : 'INACTIF'}
          </span>
          <span className="text-xs text-slate-500">Début du contrat&nbsp;: {formatDate(identity?.contract_start_date)}</span>
        </div>
      </header>

      <div className="space-y-3 p-4">
        <Section title="Responsable">
          <Field label="Nom" value={displayValue(identity?.responsable_name)} />
          <Field label="Contact" value={displayValue(identity?.responsable_contact)} />
          <Field label="ID responsable" value={displayUserId(identity?.responsable_user_id, identity?.responsable_username)} />
        </Section>

        <Section title="Commercial">
          <Field label="Nom" value={displayValue(identity?.commercial_name)} />
          <Field label="Contact" value={displayValue(identity?.commercial_contact)} />
          <Field label="ID commercial" value={displayUserId(identity?.commercial_user_id, identity?.commercial_username)} />
        </Section>

        <Section title="Numéro MasterSIM">
          <Field label="MasterSIM" value={displayValue(identity?.master_sim_number)} />
          <Field label="Adresse" value={displayValue(identity?.address)} />
          <Field label="Créé le" value={formatDate(identity?.created_at)} />
        </Section>

        {/* Compteurs d'exploitation — calculés côté backend */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            ['Micro-zones', identity?.nb_micro_zones],
            ['POS créés', identity?.nb_pos_crees],
            ['POS actifs', identity?.nb_pos_actifs],
            ['BTS', identity?.nb_bts],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-sky-50 p-3 text-center">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
              <div className="text-xl font-bold text-slate-900">
                {loading ? '…' : typeof value === 'number' ? value : NOT_PROVIDED}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}