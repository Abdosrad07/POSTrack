import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import BTSForm from '../../components/BTS/BTSForm'

export default function BTSSavePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [partenaires, setPartenaires] = useState([])
  const [initialData, setInitialData] = useState(null)
  const [loading, setLoading] = useState(!!id) // Ne charge que si on est en mode édition
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const isEditing = !!id

  useEffect(() => {
    const fetchData = async () => {
      setError(null)
      try {
        const partenairesRes = await api.get('/partenaires')
        setPartenaires(partenairesRes.data.data || partenairesRes.data || [])

        if (isEditing) {
          setLoading(true)
          const btsRes = await api.get(`/bts/${id}`)
          setInitialData(btsRes.data.data || btsRes.data)
        }
      } catch (err) {
        console.error(err)
        setError('Erreur lors du chargement des données.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, isEditing])

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true)
      setError(null)
      if (isEditing) {
        await api.put(`/bts/${id}`, formData)
      } else {
        await api.post('/bts', formData)
      }
      navigate('/bts')
    } catch (err) {
      console.error(err)
      setError('Erreur lors de la sauvegarde. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/bts')
  }
  
  if (loading) return <div>Chargement du formulaire...</div>
  if (error && isEditing) return <div className="text-red-500">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Modifier la BTS' : 'Nouvelle BTS'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isEditing ? 'Modification des informations de la station de base.' : "Création d'une nouvelle station de base."}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <BTSForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          partenaires={partenaires}
          isSubmitting={isSubmitting}
        />
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}
