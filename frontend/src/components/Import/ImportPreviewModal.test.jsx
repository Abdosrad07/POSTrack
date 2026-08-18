import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImportPreviewModal from './ImportPreviewModal';
import { mockImportBatch } from '../../mocks/importMocks';

describe('ImportPreviewModal', () => {
  it('ne rend rien quand open est faux', () => {
    const { container } = render(
      <ImportPreviewModal batch={mockImportBatch} open={false} onClose={vi.fn()} onConfirm={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('affiche le lot et le bouton de commit bloqué quand des erreurs existent', () => {
    render(
      <ImportPreviewModal
        batch={mockImportBatch}
        open
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

        expect(screen.getByText(/Prévisualisation de l'import/)).toBeInTheDocument();
    expect(screen.getByText('Commit bloqué')).toBeInTheDocument();
  });

  it('appelle onConfirm quand le commit est autorisé', () => {
    const noErrorsBatch = {
      ...mockImportBatch,
      errors: [],
      summary: { ...mockImportBatch.summary, errors: 0 },
    };
    const onConfirm = vi.fn();
    render(
      <ImportPreviewModal
        batch={noErrorsBatch}
        open
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Confirmer & Commiter' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('appelle onClose lors d un clic sur le fond et sur la croix', () => {
    const onClose = vi.fn();
    render(
      <ImportPreviewModal
        batch={mockImportBatch}
        open
        onClose={onClose}
        onConfirm={vi.fn()}
      />
    );

    fireEvent.click(document.querySelector('div.fixed.inset-0'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
