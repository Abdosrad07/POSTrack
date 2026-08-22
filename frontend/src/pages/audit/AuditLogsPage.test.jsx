import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuditLogsPage from './AuditLogsPage';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('AuditLogsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche les logs d audit', async () => {
    api.get.mockResolvedValueOnce({
      data: [
        { id: 1, action: 'CREATE', entity_type: 'POS', entity_id: 10, details: 'Création POS', created_at: '2026-08-22T10:00:00Z' },
      ],
    });

    render(
      <MemoryRouter>
        <AuditLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('CREATE')).toBeInTheDocument());
    expect(screen.getByText('POS')).toBeInTheDocument();
    expect(screen.getByText('Création POS')).toBeInTheDocument();
  });

  it('affiche une erreur si le backend échoue', async () => {
    api.get.mockRejectedValueOnce(new Error('Erreur API'));

    render(
      <MemoryRouter>
        <AuditLogsPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Audit indisponible')).toBeInTheDocument());
  });
});