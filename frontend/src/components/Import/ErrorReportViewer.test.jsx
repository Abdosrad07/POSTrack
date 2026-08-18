import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorReportViewer from './ErrorReportViewer';

describe('ErrorReportViewer', () => {
  it('affiche un message de succès quand il n y a ni erreur ni avertissement', () => {
    render(<ErrorReportViewer errors={[]} warnings={[]} />);
    expect(screen.getByText(/Aucune erreur détectée/)).toBeInTheDocument();
  });

  it('affiche le nombre d erreurs et la liste des messages', () => {
    const errors = [
      { row: 5, column: 'nom_pos', message: 'Le nom du POS est obligatoire.', severity: 'ERROR' },
      { row: 6, column: 'ville', message: 'Ville inconnue.', severity: 'ERROR' },
    ];
    render(<ErrorReportViewer errors={errors} warnings={[]} />);

    expect(screen.getAllByText('ERROR').length).toBe(2);
    expect(screen.getByText('Ligne 5')).toBeInTheDocument();
    expect(screen.getByText(/Le nom du POS est obligatoire./)).toBeInTheDocument();
  });

  it('compte et affiche les avertissements séparément', () => {
    render(
      <ErrorReportViewer
        errors={[{ row: 2, column: 'a', message: 'Erreur', severity: 'ERROR' }]}
        warnings={[{ row: 3, column: 'b', message: 'Alerte', severity: 'WARNING' }]}
      />
    );

    const chips = screen.getAllByText((content, el) => el.className.includes('rounded-full'));
    expect(chips.length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('ERROR').length).toBe(1);
    expect(screen.getAllByText('WARNING').length).toBe(1);
  });
});
