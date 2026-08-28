import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Alert from '../../components/Common/Alert/Alert'
import Button from '../../components/Common/Button/Button'
import PageHeader from '../../components/Common/PageHeader/PageHeader'
import FormField from '../../components/Common/FormField/FormField'

export default function POSCreatePage() {
  const navigate = useNavigate()
  const [serial, setSerial] = useState('')
  const [modele, setModele] = useState('')
  const [partenaireId, setPartenaireId] = useState('')
  const [partenaires, setPartenaires] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ serial: '', modele: '' })

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

  const validate = () => {
    const errs = { serial: '', modele: '' }
    if (!serial.trim()) errs.serial = 'Le N° Série est obligatoire.'
    else if (serial.trim().length < 3) errs.serial = 'Format attendu : POS-001 (3 caractères minimum).'
    if (!modele.trim()) errs.modele = 'Le Modèle est obligatoire.'
    setFieldErrors(errs)
    return !errs.serial && !errs.modele
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError('')
    try {
      await api.post('/pos', {
        serial,
        modele,
        partenaire_id: partenaireId ? Number(partenaireId) : null,
      })
      setSuccess('POS créé avec succès')
      setTimeout(() => navigate('/pos'), 700)
    } catch (err) {
      console.error(err)
      setError('Erreur lors de la création. Vérifiez le backend et réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Nouveau POS"
        subtitle="Ajoutez un nouveau terminal à la plateforme."
        breadcrumbs={['Espace partenaire', 'POS', 'Nouveau']}
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} />}

      <form onSubmit={handleSubmit} className="card card-body space-y-5" noValidate>
        <FormField
          label="N° Série"
          htmlFor="pos-serial"
          required
          error={fieldErrors.serial || undefined}
          help="Format conseillé : POS-001"
        >
          <input
            id="pos-serial"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            aria-invalid={Boolean(fieldErrors.serial)}
            className="input"
            placeholder="POS-001"
          />
        </FormField>

        <FormField label="Modèle" htmlFor="pos-modele" required error={fieldErrors.modele || undefined}>
          <input
            id="pos-modele"
            value={modele}
            onChange={(e) => setModele(e.target.value)}
            aria-invalid={Boolean(fieldErrors.modele)}
            className="input"
            placeholder="Ex. Kiosk Pro"
          />
        </FormField>

        <FormField label="Partenaire" htmlFor="pos-partenaire">
          <select
            id="pos-partenaire"
            value={partenaireId}
            onChange={(e) => setPartenaireId(e.target.value)}
            className="select"
          >
            <option value="">-- Aucun --</option>
            {partenaires.map((p) => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
        </FormField>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
          <Button variant="secondary" type="button" onClick={() => navigate('/pos')}>
            Annuler
          </Button>
          <Button
            variant="primary"
            type="submit"
            className={loading ? 'btn-loading' : undefined}
            aria-busy={loading}
            disabled={loading}
          >
            {loading ? 'Enregistrement…' : 'Créer le POS'}
          </Button>
        </div>
      </form>
    </div>
  )
}