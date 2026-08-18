import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImportExportPage from './ImportExportPage';
import importService from '../../services/importService';
import { mockImportBatch } from '../../mocks/importMocks';

// Lot sans erreur bloquante pour pouvoir passer à l'étape du commit.
const validBatch = {
  ...mockImportBatch,
  errors: [],
  warnings: [],
  summary: { ...mockImportBatch.summary, errors: 0, warnings: 0 },
};

vi.mock('../../services/importService', () => ({
  __esModule: true,
  default: {
    validate: vi.fn(),
    apply: vi.fn(),
    getTemplateUrl: vi.fn(() => '#template'),
  },
}));

describe('ImportExportPage — Module A3 (workflow 5 étapes)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('partner_context_id', '1');
    importService.validate.mockResolvedValue(validBatch);
    importService.apply.mockResolvedValue({ id: validBatch.id, status: 'APPLIED' });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('affiche la vue d installation (gabarit + type + dépôt) au chargement', () => {
    render(<ImportExportPage />);
    expect(screen.getByText(/Type d'entité/)).toBeInTheDocument();
    expect(screen.getByText(/Déposez votre fichier/)).toBeInTheDocument();
    expect(screen.getByText(/Prêt à importer/)).toBeInTheDocument();
  });

  it('valide le fichier puis affiche la prévisualisation du lot', async () => {
    render(<ImportExportPage />);

    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [new File(['x'], 'export.xlsx')] } });

        fireEvent.click(screen.getByRole('button', { name: 'Valider le fichier' }));

        // La prévisualisation du lot apparaît après validation asynchrone.
    const applyBtn = await screen.findByRole('button', { name: "5. Appliquer l'import" });
    expect(applyBtn).toBeEnabled();
  });

  it("commit le lot depuis la modal de prévisualisation et affiche la page de succès", async () => {
    render(<ImportExportPage />);

    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [new File(['x'], 'export.xlsx')] } });
    fireEvent.click(screen.getByRole('button', { name: 'Valider le fichier' }));

        const applyBtn = await screen.findByRole('button', { name: "5. Appliquer l'import" });
    fireEvent.click(applyBtn);

    const confirmBtn = await screen.findByRole('button', { name: 'Confirmer & Commiter' });
    fireEvent.click(confirmBtn);

    expect(await screen.findByText(/Import appliqué avec succès/)).toBeInTheDocument();
    expect(importService.apply).toHaveBeenCalledWith(validBatch.id);
  });

  it("désactive le commit quand le lot comporte des erreurs bloquantes", async () => {
    const batchWithErrors = {
      ...validBatch,
      errors: [{ row: 2, column: 'nom_pos', message: 'Manquant', severity: 'ERROR' }],
      summary: { ...validBatch.summary, errors: 1 },
    };
    importService.validate.mockResolvedValue(batchWithErrors);

    render(<ImportExportPage />);

    fireEvent.change(screen.getByTestId('file-input'), {
      target: { files: [new File(['x'], 'export.xlsx')] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Valider le fichier' }));

        const applyBtn = await screen.findByRole('button', { name: /Appliquer/ });
    expect(applyBtn).toBeDisabled();
  });

  it("passe à l'état d'erreur si la validation échoue", async () => {
    importService.validate.mockRejectedValue(new Error('Service indisponible'));

    render(<ImportExportPage />);

    fireEvent.change(screen.getByTestId('file-input'), {
      target: { files: [new File(['x'], 'export.xlsx')] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Valider le fichier' }));

    expect(await screen.findByText("L'import a échoué")).toBeInTheDocument();
  });
});
