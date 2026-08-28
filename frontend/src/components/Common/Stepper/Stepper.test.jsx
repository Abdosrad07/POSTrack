import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Stepper from './Stepper'

const steps = [
  { label: 'Identité', description: 'Informations générales' },
  { label: 'Localisation' },
  { label: 'Confirmation' },
]

describe('Stepper', () => {
  it('affiche toutes les étapes', () => {
    render(<Stepper steps={steps} current={1} />)
    expect(screen.getByText('Identité')).toBeInTheDocument()
    expect(screen.getByText('Localisation')).toBeInTheDocument()
    expect(screen.getByText('Confirmation')).toBeInTheDocument()
  })

  it('marque l’étape courante avec aria-current', () => {
    render(<Stepper steps={steps} current={1} />)
    expect(screen.getByText('Localisation').closest('li')).toHaveAttribute('aria-current', 'step')
  })

  it('permet de revenir à une étape validée', () => {
    const onStepClick = vi.fn()
    render(<Stepper steps={steps} current={2} onStepClick={onStepClick} />)
    fireEvent.click(screen.getByRole('button', { name: 'Étape 1 : Identité' }))
    expect(onStepClick).toHaveBeenCalledWith(0)
  })

  it('affiche la description de l’étape sur desktop', () => {
    render(<Stepper steps={steps} current={0} />)
    expect(screen.getByText('Informations générales')).toBeInTheDocument()
  })
})
