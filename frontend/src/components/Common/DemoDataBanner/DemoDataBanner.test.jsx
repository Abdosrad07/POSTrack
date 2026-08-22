import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import DemoDataBanner from './DemoDataBanner';

describe('DemoDataBanner', () => {
  it('affiche le titre et le message par défaut', () => {
    render(<DemoDataBanner />);
    expect(screen.getByText('Données de démo')).toBeInTheDocument();
    expect(screen.getByText(/backend/)).toBeInTheDocument();
  });

  it('affiche un message personnalisé', () => {
    render(<DemoDataBanner message="Message personnalisé pour ce contexte." />);
    expect(screen.getByText('Message personnalisé pour ce contexte.')).toBeInTheDocument();
  });

  it('rend la variante compacte pour les barres de contexte', () => {
    render(<DemoDataBanner compact message="Variante compacte." />);
    expect(screen.getByText('Données de démo')).toBeInTheDocument();
    expect(screen.getByText('Variante compacte.')).toBeInTheDocument();
  });
});