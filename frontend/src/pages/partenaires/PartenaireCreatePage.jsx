import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Alert from '../../components/Common/Alert/Alert'

export default function PartenaireCreatePage() {
  const navigate = useNavigate()
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!nom.trim() || !email.trim()) {
        setLoading(false)
        setError('Le nom et l\'email sont requis.')
        return
      }
      // simple email regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setLoading(false)
        setError('Adresse email invalide.')
        return
      }

      await api.post('/partenaires', { nom, email, telephone })
      setSuccess('Partenaire créé avec succès')
      setTimeout(() => navigate('/partenaires'), 700)
    } catch (err) {
      console.error(err)
      setError('Erreur lors de la création. Mode mock utilisé.')
      setTimeout(() => navigate('/partenaires'), 700)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau Partenaire</h1>
        <p className="mt-1 text-sm text-gray-600">Créez un nouveau partenaire.</p>
      </div>
      <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-sm">
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
        {success && <div className="mb-4"><Alert type="success" message={success} /></div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input value={nom} onChange={(e)=>setNom(e.target.value)} required className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Téléphone</label>
            <input value={telephone} onChange={(e)=>setTelephone(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>
        </div>
        <div className="mt-4">
          <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-white">{loading ? 'Enregistrement...' : 'Créer'}</button>
        </div>
      </form>
    </div>
  )
}
