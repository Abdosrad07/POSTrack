import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SimsStockPage from './SimsStockPage';

const getMock = vi.fn();

vi.mock('../../services/api', () => ({
  default: { get: (...args) => getMock(...args) },
}));

describe('SimsStockPage', () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it('affiche le stock SIM', async () => {
    getMock.mockResolvedValueOnce({ data: { items: [{ id: 1, iccid: '8923700000000000001', pos: { code_pos: 'POS-001' }, status: 'EN_STOCK' }] } });

    render(<SimsStockPage />);

    expect(screen.getByText('Chargement du stock SIM...')).toBeInTheDocument();
    expect(await screen.findByText('8923700000000000001')).toBeInTheDocument();
    expect(screen.getByText('POS-001')).toBeInTheDocument();
    expect(screen.getByText('EN_STOCK')).toBeInTheDocument();
  });

  it('affiche un empty state si vide', async () => {
    getMock.mockResolvedValueOnce({ data: { items: [] } });

    render(<SimsStockPage />);

    expect(await screen.findByText('Aucune SIM')).toBeInTheDocument();
  });
});