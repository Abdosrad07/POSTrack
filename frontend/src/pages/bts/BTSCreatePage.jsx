import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import BTSForm from '../../components/BTS/BTSForm'

export default function BTSCreatePage() {
  const navigate = useNavigate()
  const [partenaires, setPartenaires] = useState([])
  const [initialData, setInitialData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchPartenaires = async () => {
    try {
      const response = await api.get('/partenaires')
      setPartenaires(response.data.data || response.data || [])
    } catch {
      setPartenaires([])
    }
  }

  useEffect(() => {
    fetchPartenaires()
  }, [])

  const handleSubmit = async (formData) => {
    try {
      setLoading(true)
      if (initialData) {
        await api.put(`/bts/${initialData.id}`, formData)
      } else {
        await api.post('/bts', formData)
      }
      navigate('/bts')
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/bts')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {initialData ? 'Modifier la BTS' : 'Nouvelle BTS'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {initialData ? 'Modification des informations de la station de base.' : 'Création d\'une nouvelle station de base.'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <BTSForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          partenaires={partenaires}
        />
      </div>
    </div>
  )
}

