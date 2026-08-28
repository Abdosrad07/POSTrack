import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SegmentedControl from './SegmentedControl'

const options = [
  { value: 'list', label: 'Liste' },
  { value: 'map', label: 'Carte' },
]

describe('SegmentedControl', () => {
  it('marque l’option active avec aria-pressed', () => {
    render(<SegmentedControl options={options} value="map" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Liste' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Carte' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('notifie le changement d’option', () => {
    const onChange = vi.fn()
    render(<SegmentedControl options={options} value="list" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Carte' }))
    expect(onChange).toHaveBeenCalledWith('map')
  })

  it('ne re-notifie pas au clic sur l’option déjà active', () => {
    const onChange = vi.fn()
    render(<SegmentedControl options={options} value="list" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Liste' }))
    expect(onChange).not.toHaveBeenCalled()
  })
})
