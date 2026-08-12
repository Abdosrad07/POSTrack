import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'mock-token')
  })

  it('should render the Dashboard page by default', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('should render the POS list page', () => {
    render(
      <MemoryRouter initialEntries={['/pos']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Liste des POS')).toBeInTheDocument()
  })

  it('should render the Partners list page', () => {
    render(
      <MemoryRouter initialEntries={['/partenaires']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Liste des Partenaires')).toBeInTheDocument()
  })
})


