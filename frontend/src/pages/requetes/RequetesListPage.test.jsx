import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import RequetesListPage from './RequetesListPage';

const getMock = vi.fn();

vi.mock('../../services/api', () => ({
  default: { get: (...args) => getMock(...args) },
}));

describe('RequetesListPage', () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it('affiche les requêtes', async () => {
    getMock.mockResolvedValueOnce({ data: { items: [{ id: 1, titre: 'Incident POS', type_requete: 'INCIDENT', priorite: 'HAUTE', statut: 'OUVERTE', entites: [{ entity_type: 'POS', entity_id: 10 }] }] } });

    render(<RequetesListPage />);

    expect(screen.getByText('Chargement des requêtes...')).toBeInTheDocument();
    expect(await screen.findByText('Incident POS')).toBeInTheDocument();
    expect(screen.getByText('INCIDENT')).toBeInTheDocument();
    expect(screen.getByText('HAUTE')).toBeInTheDocument();
    expect(screen.getByText('OUVERTE')).toBeInTheDocument();
  });

  it('affiche un empty state si aucune requête', async () => {
    getMock.mockResolvedValueOnce({ data: { items: [] } });

    render(<RequetesListPage />);

    expect(await screen.findByText('Aucune requête')).toBeInTheDocument();
  });
});