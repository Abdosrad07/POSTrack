import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SimsStockPage from './SimsStockPage';

const getMock = vi.fn();

vi.mock('../../services/api', () => ({
  default: { get: (...args) => getMock(...args) },
}));

describe('SimsStockPage', () => {
  beforeEach(() => {
    getMock.mockReset();
    // Réponse sûre par défaut : la page effectue DEUX appels parallèles
    // (stock SIM via simService, et liste des POS via api.get('/pos')).
    // Sans implémentation par défaut, le second appel reçoit undefined
    // et plante sur ".then" (TypeError: reading 'then').
    getMock.mockImplementation((url) => {
      if (String(url).includes('/pos')) {
        return Promise.resolve({ data: { items: [], pagination: { page: 1, pages: 1, total: 0 } } });
      }
      return Promise.resolve({ data: { items: [] } });
    });
  });

  it('affiche le stock SIM dans l\'inventaire', async () => {
    const user = userEvent.setup();
    // Routage par URL : robuste quel que soit l'ordre d'exécution
    // des deux appels parallèles (stock SIM vs liste des POS).
    getMock.mockImplementation((url) => {
      if (String(url).includes('/pos')) {
        return Promise.resolve({
          data: { items: [{ id: 1, code_pos: 'POS-001', name: 'Kiosque Akwa' }], pagination: { page: 1, pages: 1, total: 1 } },
        });
      }
      return Promise.resolve({
        data: { items: [{ id: 1, iccid: '8923700000000000001', numero_msisdn: '699123456', pos_id: 1, status: 'EN_STOCK' }] },
      });
    });

    render(<SimsStockPage />);

    expect(screen.getByText('Chargement du stock SIM...')).toBeInTheDocument();

    // La table d'inventaire est derrière l'onglet « Inventaire »
    await user.click(screen.getByRole('button', { name: 'Inventaire' }));

    expect(await screen.findByText('699123456')).toBeInTheDocument();
    expect(screen.getByText(/POS-001/)).toBeInTheDocument();
    // EN_STOCK apparaît dans la cellule ET dans l'option du filtre de statut
    expect(screen.getAllByText('EN_STOCK').length).toBeGreaterThan(0);
  });

  it('affiche un empty state si vide', async () => {
    const user = userEvent.setup();

    render(<SimsStockPage />);

    await user.click(screen.getByRole('button', { name: 'Inventaire' }));

    expect(await screen.findByText("Aucune SIM dans l'inventaire")).toBeInTheDocument();
  });
});
