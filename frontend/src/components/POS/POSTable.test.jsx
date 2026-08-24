import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import POSTable from './POSTable';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('POSTable', () => {
  it('affiche la colonne des coordonnées', () => {
    const rows = [
      {
        id: 1,
        code_pos: 'POS-001',
        nom: 'POS Coordonné',
        type_pos: 'NOUVEAU',
        partenaire: { nom: 'Partenaire A' },
        dsm: { nom_complet: 'DSM A' },
        latitude: 4.0511,
        longitude: 9.7679,
        statut: 'ACTIF',
        date_expiration: '2026-12-31',
      },
    ];

    render(
      <MemoryRouter>
        <POSTable rows={rows} />
      </MemoryRouter>
    );

    expect(screen.getByText('Coordonnées')).toBeInTheDocument();
    expect(screen.getByText('4.0511, 9.7679')).toBeInTheDocument();
  });
});