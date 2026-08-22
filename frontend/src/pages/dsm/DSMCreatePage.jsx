import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Alert from '../../components/Common/Alert/Alert'
export default function DSMCreatePage() {
  const navigate = useNavigate()
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [region, setRegion] = useState('Nord')
  const [statut, setStatut] = useState('actif')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (!nom.trim() || !email.trim()) {
        setError('Nom et email sont requis.')
        setLoading(false)
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError('Email invalide.')
        setLoading(false)
        return
      }
      // Schéma v4 : DSMCreate attend matricule / full_name / zone.
      // (email & statut sont des champs legacy sans équivalent backend.)
      await api.post('/dsm', {
        matricule: `DSM-${nom.trim().toUpperCase().replace(/\s+/g, '-')}`,
        full_name: nom.trim(),
        zone: region,
      })
      setSuccess('DSM créé avec succès')
      setTimeout(() => navigate('/dsm'), 700)
    } catch (err) {
      console.error(err)
      setError('Erreur lors de la création. Vérifiez le backend et réessayez.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau DSM</h1>
        <p className="mt-1 text-sm text-gray-600">Créez un nouveau délégué commercial.</p>
      </div>
      <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-sm">
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
        {success && <div className="mb-4"><Alert type="success" message={success} /></div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input value={nom} onChange={(e) => setNom(e.target.value)} required className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Région</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2">
              <option value="Nord">Nord</option>
              <option value="Sud">Sud</option>
              <option value="Est">Est</option>
              <option value="Ouest">Ouest</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select value={statut} onChange={(e) => setStatut(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2">
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-white">{loading ? 'Enregistrement...' : 'Créer'}</button>
        </div>
      </form>
    </div>
  )
}
