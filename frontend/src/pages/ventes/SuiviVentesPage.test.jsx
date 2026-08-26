import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SuiviVentesPage from './SuiviVentesPage';
import { PartnerContext } from '../../context/PartnerContext';
import analyticsService from '../../services/analyticsService';

vi.mock('../../services/analyticsService', () => ({
  default: {
    getSalesSummary: vi.fn(),
    listSalesTargets: vi.fn(),
    getLoadingSummary: vi.fn(),
    getMonthlyTable: vi.fn(),
    getDashboard: vi.fn(),
  },
}));

const partnerValue = { partnerContextId: 2 };

const salesSummary = {
  partner_id: 2,
  creation: { objectif: 10, cumul: 6, stock_initial: 20, progression: 60 },
  redeploiement: { objectif: 8, cumul: 3, stock_initial: 15, progression: 37.5 },
  sell_out: { objectif: 50, cumul: 30, progression: 60 },
  loading: { objectif: 100, cumul: 70, progression: 70 },
};

function mockOk() {
  analyticsService.getSalesSummary.mockResolvedValue({ data: salesSummary });
  analyticsService.listSalesTargets.mockResolvedValue({
    data: {
      items: [
        {
          id: 1,
          month: '2026-09-01',
          creation_target: 10,
          redeployment_target: 8,
          sell_out_target: 50,
          loading_target: 100,
          creation_stock_initial: 12,
          redeployment_stock_initial: 15,
        },
      ],
    },
  });
  analyticsService.getLoadingSummary.mockResolvedValue({ data: { loading: 70, objectif: 100, by_dsm: [] } });
  analyticsService.getMonthlyTable.mockResolvedValue({
    data: {
      sell_out: { rows: [] },
      loading: { rows: [] },
      creation: { rows: [] },
      redeploiement: { rows: [] },
    },
  });
  analyticsService.getDashboard.mockResolvedValue({
    data: { montant_primes_periode: 250000, primes_validees: 5, primes_en_attente: 2 },
  });
}

describe('SuiviVentesPage', () => {
  it("affiche les sections du module sans perte de données", async () => {
    mockOk();
    renderOk();
    await waitFor(() => expect(screen.getByText('Objectifs de vente')).toBeInTheDocument());

    // En-têtes de sections présentes
    expect(screen.getByText('Recettes')).toBeInTheDocument();
    expect(screen.getByText('Tableau mensuel')).toBeInTheDocument();
    // Recette en FCFA (fichier formaté fr-FR)
    expect(screen.getByText('250 000 FCFA')).toBeInTheDocument();
    // Stock final création = stock_initial (20) − cumul (6) = 14
    expect(screen.getByText('Stock final création')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
  });

  it("affiche un état d'erreur si le backend répond mal", async () => {
    analyticsService.getSalesSummary.mockRejectedValueOnce(new Error('boom'));
    renderOk();
    expect(await screen.findByText('Erreur de chargement')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
  });
});

function renderOk() {
  return render(
    <PartnerContext.Provider value={partnerValue}>
      <SuiviVentesPage />
    </PartnerContext.Provider>
  );
}