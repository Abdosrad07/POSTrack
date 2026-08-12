import { useState, useEffect } from 'react'

const STATUS_OPTIONS = [
  { value: 'actif', label: 'Actif' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inactif', label: 'Inactif' },
]

const defaultForm = {
  code: '',
  nom: '',
  localisation: '',
  latitude: '',
  longitude: '',
  statut: 'actif',
  altitude: '',
  partenaire_id: '',
  date_installation: '',
}

export default function BTSForm({ initialData, onSubmit, onCancel, partenaires = [] }) {
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setForm({
        code: initialData.code || '',
        nom: initialData.nom || '',
        localisation: initialData.localisation || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        statut: initialData.statut || 'actif',
        altitude: initialData.altitude || '',
        partenaire_id: initialData.partenaire_id || '',
        date_installation: initialData.date_installation || '',
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
    if (!form.code.trim()) newErrors.code = 'Le code est requis'
    if (!form.nom.trim()) newErrors.nom = 'Le nom est requis'
    if (!form.localisation.trim()) newErrors.localisation = 'La localisation est requise'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            Code BTS <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={form.code}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${
              errors.code ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
            placeholder="Ex: BTS-001"
          />
          {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
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
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${
              errors.nom ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
            placeholder="Ex: BTS Centrale Douala"
          />
          {errors.nom && <p className="mt-1 text-xs text-red-600">{errors.nom}</p>}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="localisation" className="block text-sm font-medium text-gray-700">
            Localisation <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="localisation"
            name="localisation"
            value={form.localisation}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${
              errors.localisation ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
            placeholder="Ex: Douala, quartier Akwa"
          />
{errors.localisation && <p className="mt-1 text-xs text-red-600">{errors.localisation}</p>}
        </div>

        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
            Latitude
          </label>
          <input
            type="text"
            id="latitude"
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Ex: 4.0511"
          />
        </div>

        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
            Longitude
          </label>
          <input
            type="text"
            id="longitude"
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Ex: 9.6843"
          />
        </div>

        <div>
          <label htmlFor="altitude" className="block text-sm font-medium text-gray-700">
            Altitude (m)
          </label>
          <input
            type="text"
            id="altitude"
            name="altitude"
            value={form.altitude}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Ex: 50"
          />
        </div>

        <div>
          <label htmlFor="partenaire_id" className="block text-sm font-medium text-gray-700">
            Partenaire
          </label>
          <select
            id="partenaire_id"
            name="partenaire_id"
            value={form.partenaire_id}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Sélectionner un partenaire</option>
            {partenaires.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="statut" className="block text-sm font-medium text-gray-700">
            Statut
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
          <label htmlFor="date_installation" className="block text-sm font-medium text-gray-700">
            Date d'installation
          </label>
          <input
            type="date"
            id="date_installation"
            name="date_installation"
            value={form.date_installation}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
          {errors.localisation && <p className="mt-1 text-xs text-red-600">{errors.localisation}</p>}
        </div>


  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(form)
    }
  }

