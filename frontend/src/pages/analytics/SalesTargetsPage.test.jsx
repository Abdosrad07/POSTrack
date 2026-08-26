import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import SalesTargetsPage from './SalesTargetsPage';

vi.mock('../../hooks/usePartner', () => ({
  default: () => ({ partnerContextId: 2, partner: { nom: 'Master Color' } }),
}));

vi.mock('../../services/analyticsService', () => ({
  default: {
    listSalesTargets: vi.fn().mockResolvedValue({ data: [] }),
    upsertSalesTarget: vi.fn(),
  },
}));

describe('SalesTargetsPage', () => {
  it('affiche la page de saisie des objectifs', async () => {
    render(
      <MemoryRouter>
        <SalesTargetsPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Objectifs de ventes partenaire/i })).toBeInTheDocument();
  });
});