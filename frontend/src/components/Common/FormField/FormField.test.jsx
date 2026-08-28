import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import FormField from './FormField'

describe('FormField', () => {
  it('associe le label au champ via htmlFor', () => {
    render(
      <FormField label="Nom du POS" htmlFor="pos-nom">
        <input id="pos-nom" className="input" />
      </FormField>,
    )
    expect(screen.getByLabelText('Nom du POS')).toBeInTheDocument()
  })

  it('affiche l’astérisque pour un champ requis', () => {
    render(
      <FormField label="Code" htmlFor="code" required>
        <input id="code" className="input" />
      </FormField>,
    )
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('affiche le message d’erreur avec role=alert', () => {
    render(
      <FormField label="Code" htmlFor="code" error="Le code est obligatoire">
        <input id="code" className="input" aria-invalid="true" />
      </FormField>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Le code est obligatoire')
  })

  it('affiche l’aide en l’absence d’erreur', () => {
    render(
      <FormField label="Code" htmlFor="code" help="Format : PART-001">
        <input id="code" className="input" />
      </FormField>,
    )
    expect(screen.getByText('Format : PART-001')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
