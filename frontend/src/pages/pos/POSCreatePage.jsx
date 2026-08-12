import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Alert from '../../components/Common/Alert/Alert'

export default function POSCreatePage() {
  const navigate = useNavigate()
  const [serial, setSerial] = useState('')
  const [modele, setModele] = useState('')
  const [partenaire, setPartenaire] = useState('')
  const [partenaires, setPartenaires] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let mounted = true
    const fetch = async () => {
      try {
        const res = await api.get('/partenaires')
        if (mounted) setPartenaires(res.data.data || res.data || [])
      } catch (e) {
        if (mounted) setPartenaires([])
      }
    }
    void fetch()
    return () => { mounted = false }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!serial.trim() || !modele.trim()) {
        setError('Les champs N° Série et Modèle sont requis.')
        setLoading(false)
        return
      }
      await api.post('/pos', { serial, modele, partenaire })
      setSuccess('POS créé avec succès')
      setTimeout(() => navigate('/pos'), 700)
    } catch (err) {
      console.error(err)
      setError('Erreur lors de la création. Mode mock utilisé.')
      setTimeout(() => navigate('/pos'), 700)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau POS</h1>
        <p className="mt-1 text-sm text-gray-600">Ajoutez un nouveau terminal.</p>
      </div>
      <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-sm">
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
        {success && <div className="mb-4"><Alert type="success" message={success} /></div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">N° Série</label>
            <input value={serial} onChange={(e)=>setSerial(e.target.value)} required className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Modèle</label>
            <input value={modele} onChange={(e)=>setModele(e.target.value)} required className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Partenaire</label>
            <select value={partenaire} onChange={(e)=>setPartenaire(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2">
              <option value="">-- Aucun --</option>
              {partenaires.map(p => (
                <option key={p.id} value={p.nom}>{p.nom}</option>
              ))}
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
