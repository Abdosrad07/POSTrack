import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Pagination from './Pagination'

describe('Pagination', () => {
  it('affiche la plage affichée et le total', () => {
    render(<Pagination page={2} pageSize={10} total={45} onPageChange={() => {}} />)
    expect(screen.getByText('11–20')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()
  })

  it('n’affiche rien si total = 0', () => {
    const { container } = render(<Pagination page={1} pageSize={10} total={0} onPageChange={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('notifie le changement de page', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={2} pageSize={10} total={45} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('désactive précédent sur la première page', () => {
    render(<Pagination page={1} pageSize={10} total={45} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Page précédente' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Page suivante' })).toBeEnabled()
  })
})
