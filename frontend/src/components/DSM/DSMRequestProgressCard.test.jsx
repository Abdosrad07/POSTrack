import React from 'react';
import { render, screen } from '@testing-library/react';
import DSMRequestProgressCard from './DSMRequestProgressCard';

describe('DSMRequestProgressCard', () => {
  const mockData = {
    total: 10,
    en_cours: 4,
    terminees: 5,
    en_retard: 1,
    progression: 50.0,
  };

  it('affiche le titre et la description', () => {
    render(<DSMRequestProgressCard data={mockData} />);
    expect(screen.getByText('Progression des requêtes')).toBeInTheDocument();
    expect(screen.getByText(/Évolution détaillée des requêtes du DSM/)).toBeInTheDocument();
  });

  it('affiche la progression globale avec la barre de progression', () => {
    render(<DSMRequestProgressCard data={mockData} />);
    expect(screen.getByText('Progression globale')).toBeInTheDocument();
    expect(screen.getByText('50.0%')).toBeInTheDocument();
  });

  it('affiche les 4 indicateurs détaillés', () => {
    render(<DSMRequestProgressCard data={mockData} />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('En cours')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Terminées')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('En retard')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('affiche la note explicative sur les données DSM', () => {
    render(<DSMRequestProgressCard data={mockData} />);
    expect(screen.getByText(/Note\s*:/)).toBeInTheDocument();
    expect(screen.getByText(/Cette vue présente uniquement les requêtes spécifiques à ce DSM/)).toBeInTheDocument();
  });

  it('gère le cas où data est null', () => {
    render(<DSMRequestProgressCard data={null} />);
    expect(screen.getByText('Progression des requêtes')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('gère le cas où progression est null', () => {
    const dataWithoutProgression = {
      ...mockData,
      progression: null,
    };
    render(<DSMRequestProgressCard data={dataWithoutProgression} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('affiche correctement 100% de progression', () => {
    const dataComplete = {
      ...mockData,
      total: 10,
      terminees: 10,
      en_cours: 0,
      progression: 100.0,
    };
    render(<DSMRequestProgressCard data={dataComplete} />);
    expect(screen.getByText('100.0%')).toBeInTheDocument();
  });

  it('affiche correctement 0% de progression', () => {
    const dataZeroProgression = {
      ...mockData,
      total: 10,
      terminees: 0,
      en_cours: 10,
      progression: 0.0,
    };
    render(<DSMRequestProgressCard data={dataZeroProgression} />);
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });
});