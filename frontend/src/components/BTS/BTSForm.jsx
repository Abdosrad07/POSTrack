import { useState, useEffect } from 'react'

const STATUS_OPTIONS = [
  { value: 'ACTIF', label: 'Actif' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'HORS_SERVICE', label: 'Hors service' },
]

const defaultForm = {
  code_bts: '',
  nom: '',
  partenaire_id: '',
  operateur: '',
  technologie: '',
  region: '',
  ville: '',
  latitude: '',
  longitude: '',
  capacite_max: '',
  date_mise_service: '',
  statut: 'ACTIF',
}

export default function BTSForm({ initialData, onSubmit, onCancel, partenaires = [] }) {
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setForm({
        code_bts: initialData.code_bts || '',
        nom: initialData.nom || '',
        partenaire_id: initialData.partenaire_id || '',
        operateur: initialData.operateur || '',
        technologie: initialData.technologie || '',
        region: initialData.region || '',
        ville: initialData.ville || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        capacite_max: initialData.capacite_max || '',
        date_mise_service: initialData.date_mise_service || '',
        statut: initialData.statut || 'ACTIF',
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!form.code_bts.trim()) newErrors.code_bts = 'Le code BTS est requis.'
    if (!form.nom.trim()) newErrors.nom = 'Le nom est requis.'
    if (!form.partenaire_id) newErrors.partenaire_id = 'Le partenaire est requis.'
    if (!form.operateur.trim()) newErrors.operateur = "L'opérateur est requis."
    if (!form.technologie.trim()) newErrors.technologie = 'La technologie est requise.'
    if (!form.capacite_max || parseFloat(form.capacite_max) <= 0) {
      newErrors.capacite_max = 'La capacité maximale doit être un nombre positif.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const renderError = (value) => {
    if (typeof value === 'string') return value
    if (Array.isArray(value)) return value.map(renderError).filter(Boolean).join(' · ')
    if (value && typeof value === 'object') {
      if (typeof value.msg === 'string') return value.msg
      if (typeof value.detail === 'string') return value.detail
      if (Array.isArray(value.detail)) return renderError(value.detail)
      return Object.values(value).map(renderError).filter(Boolean).join(' · ')
    }
    return ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(form)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="code_bts" className="block text-sm font-medium text-gray-700">
            Code BTS <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="code_bts"
            name="code_bts"
            value={form.code_bts}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${errors.code_bts ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
            placeholder="Ex: BTS-001"
          />
          {errors.code_bts && <p className="mt-1 text-xs text-red-600">{renderError(errors.code_bts)}</p>}
        </div>

        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={form.nom}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${errors.nom ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
            placeholder="Ex: BTS Centrale Douala"
          />
          {errors.nom && <p className="mt-1 text-xs text-red-600">{renderError(errors.nom)}</p>}
        </div>

        <div>
          <label htmlFor="partenaire_id" className="block text-sm font-medium text-gray-700">
            Partenaire <span className="text-red-500">*</span>
          </label>
          <select
            id="partenaire_id"
            name="partenaire_id"
            value={form.partenaire_id}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${errors.partenaire_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
          >
            <option value="">Sélectionner un partenaire</option>
            {partenaires.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom}
              </option>
            ))}
          </select>
          {errors.partenaire_id && <p className="mt-1 text-xs text-red-600">{renderError(errors.partenaire_id)}</p>}
        </div>

        <div>
          <label htmlFor="operateur" className="block text-sm font-medium text-gray-700">
            Opérateur <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="operateur"
            name="operateur"
            value={form.operateur}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${errors.operateur ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
            placeholder="Ex: Orange, MTN"
          />
          {errors.operateur && <p className="mt-1 text-xs text-red-600">{renderError(errors.operateur)}</p>}
        </div>

        <div>
          <label htmlFor="technologie" className="block text-sm font-medium text-gray-700">
            Technologie <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="technologie"
            name="technologie"
            value={form.technologie}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${errors.technologie ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
            placeholder="Ex: 4G, 5G"
          />
          {errors.technologie && <p className="mt-1 text-xs text-red-600">{renderError(errors.technologie)}</p>}
        </div>

        <div>
          <label htmlFor="capacite_max" className="block text-sm font-medium text-gray-700">
            Capacité max <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="capacite_max"
            name="capacite_max"
            value={form.capacite_max}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${errors.capacite_max ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
            placeholder="Ex: 1000"
          />
          {errors.capacite_max && <p className="mt-1 text-xs text-red-600">{renderError(errors.capacite_max)}</p>}
        </div>

        <div>
          <label htmlFor="date_mise_service" className="block text-sm font-medium text-gray-700">
            Date de mise en service <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date_mise_service"
            name="date_mise_service"
            value={form.date_mise_service}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${errors.date_mise_service ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
          />
          {errors.date_mise_service && <p className="mt-1 text-xs text-red-600">{renderError(errors.date_mise_service)}</p>}
        </div>

        <div>
          <label htmlFor="statut" className="block text-sm font-medium text-gray-700">
            Statut <span className="text-red-500">*</span>
          </label>
          <select
            id="statut"
            name="statut"
            value={form.statut}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700">
            Région
          </label>
          <input
            type="text"
            id="region"
            name="region"
            value={form.region}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Ex: Littoral"
          />
        </div>

        <div>
          <label htmlFor="ville" className="block text-sm font-medium text-gray-700">
            Ville
          </label>
          <input
            type="text"
            id="ville"
            name="ville"
            value={form.ville}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Ex: Douala"
          />
        </div>

        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
            Latitude
          </label>
          <input
            type="number"
            id="latitude"
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Ex: 4.0489"
          />
        </div>

        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
            Longitude
          </label>
          <input
            type="number"
            id="longitude"
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Ex: 9.7034"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {initialData ? 'Modifier la BTS' : 'Créer la BTS'}
        </button>
      </div>
    </form>
  )
}

