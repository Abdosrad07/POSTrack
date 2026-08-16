import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImportBatchTable from './ImportBatchTable';
import { mockImportBatch } from '../../mocks/importMocks';

describe('ImportBatchTable', () => {
  it('affiche la synthèse du lot (créations, mises à jour, erreurs)', () => {
    render(<ImportBatchTable batch={mockImportBatch} />);

    expect(screen.getByText('Total lignes')).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1); // créations
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1); // mises à jour / erreurs
  });

  it('rend les lignes du lot avec leur nom de POS', () => {
    render(<ImportBatchTable batch={mockImportBatch} />);

    expect(screen.getByText('POS Kotto')).toBeInTheDocument();
    expect(screen.getByText('POS Bonapriso')).toBeInTheDocument();
    expect(screen.getByText('POS Bafoussam')).toBeInTheDocument();
  });

  it('marque les lignes en erreur en rouge', () => {
    render(<ImportBatchTable batch={mockImportBatch} />);

            const errorCells = screen.getAllByText('Erreur');
    expect(errorCells.length).toBe(1); // une seule ligne invalide (ligne 5)
  });

  it('affiche l état vide quand le lot ne contient aucune ligne', () => {
    render(<ImportBatchTable batch={{ columns: [], rows: [] }} />);
    expect(screen.getByText(/Aucune ligne à prévisualiser/)).toBeInTheDocument();
  });
});
