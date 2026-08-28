import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Alert from '../../components/Common/Alert/Alert'
import Button from '../../components/Common/Button/Button'
import PageHeader from '../../components/Common/PageHeader/PageHeader'
import FormField from '../../components/Common/FormField/FormField'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function PartenaireCreatePage() {
  const navigate = useNavigate()
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ nom: '', email: '' })

  const validate = () => {
    const errs = { nom: '', email: '' }
    if (!nom.trim()) errs.nom = 'Le nom est obligatoire.'
    if (!email.trim()) errs.email = "L'email est obligatoire."
    else if (!EMAIL_REGEX.test(email)) errs.email = 'Adresse email invalide.'
    setFieldErrors(errs)
    return !errs.nom && !errs.email
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError('')
    try {
      await api.post('/partenaires', { nom, email, telephone })
      setSuccess('Partenaire créé avec succès')
      setTimeout(() => navigate('/partenaires'), 700)
    } catch (err) {
      console.error(err)
      setError('Erreur lors de la création. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Nouveau Partenaire"
        subtitle="Créez un nouveau partenaire commercial."
        breadcrumbs={['Espace partenaire', 'Partenaires', 'Nouveau']}
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} />}

      <form onSubmit={handleSubmit} className="card card-body space-y-5" noValidate>
        <FormField label="Nom" htmlFor="partner-nom" required error={fieldErrors.nom || undefined}>
          <input
            id="partner-nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            aria-invalid={Boolean(fieldErrors.nom)}
            className="input"
            placeholder="Ex. ORANGE-CI"
          />
        </FormField>

        <FormField label="Email" htmlFor="partner-email" required error={fieldErrors.email || undefined}>
          <input
            id="partner-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            className="input"
            placeholder="contact@partenaire.ci"
          />
        </FormField>

        <FormField label="Téléphone" htmlFor="partner-tel">
          <input
            id="partner-tel"
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="input"
            placeholder="+225 07 00 00 00 00"
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
          <Button variant="secondary" type="button" onClick={() => navigate('/partenaires')}>
            Annuler
          </Button>
          <Button
            variant="primary"
            type="submit"
            className={loading ? 'btn-loading' : undefined}
            aria-busy={loading}
            disabled={loading}
          >
            {loading ? 'Enregistrement…' : 'Créer le partenaire'}
          </Button>
        </div>
      </form>
    </div>
  )
}