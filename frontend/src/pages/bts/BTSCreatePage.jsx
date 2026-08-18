import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import BTSForm from '../../components/BTS/BTSForm'
import btsDebug from '../../utils/btsDebug'

export default function BTSCreatePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [partenaires, setPartenaires] = useState([])
  const [initialData, setInitialData] = useState(null)
  const [loading, setLoading] = useState(false)

  const isEditing = !!id

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        btsDebug.log('BTSCreatePage load', { id, isEditing })
        const partenairesRes = await api.get('/partenaires')
        setPartenaires(partenairesRes.data.data || partenairesRes.data || [])

        if (isEditing) {
          const btsRes = await api.get(`/bts/${id}`)
          const b = btsRes.data.data || btsRes.data
          setInitialData({ ...b, code_bts: b.code_bts || b.code })
        }
      } catch (err) {
        btsDebug.error('BTSCreatePage error', err?.response?.status, err?.response?.data || err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, isEditing])

  const handleSubmit = async (formData) => {
    try {
      setLoading(true)
      btsDebug.log('BTSCreatePage submit', { hasInitialData: Boolean(initialData), payload: formData })
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

  if (loading && isEditing) return <div>Chargement du formulaire...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {initialData ? 'Modifier la BTS' : 'Nouvelle BTS'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {initialData ? "Modification des informations de la station de base." : "Création d'une nouvelle station de base."}
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


