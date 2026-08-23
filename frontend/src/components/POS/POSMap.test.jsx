
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import POSMap from './POSMap';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Mock Leaflet components that require a DOM environment and are not easy to test in JSDOM
vi.mock('react-leaflet', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    MapContainer: ({ children, ...props }) => (
      <div data-testid="map-container" {...props}>
        {children}
      </div>
    ),
    TileLayer: (props) => <div data-testid="tile-layer" {...props} />,
    Marker: ({ children, eventHandlers, title }) => (
      <button data-testid="marker" onClick={eventHandlers.click} title={title}>
        {children}
      </button>
    ),
    Popup: ({ children }) => <div data-testid="popup">{children}</div>,
    Circle: (props) => <div data-testid="circle" {...props} />,
  };
});

describe('POSMap', () => {
  const mockPosList = [
    {
      id: 1,
      code_pos: 'POS-001',
      nom: 'POS Actif',
      latitude: 4.0,
      longitude: 10.0,
      type_pos: 'NOUVEAU',
      statut: 'ACTIF',
      adresse: 'Rue A',
      ville: 'Ville X',
      partenaire: { nom: 'Partenaire A' },
    },
    {
      id: 2,
      code_pos: 'POS-002',
      nom: 'POS Reconduit',
      latitude: 4.1,
      longitude: 10.1,
      type_pos: 'RECONDUIT',
      statut: 'SUSPENDU',
      adresse: 'Rue B',
      ville: 'Ville Y',
      partenaire: { nom: 'Partenaire B' },
    },
    {
      id: 3,
      code_pos: 'POS-003',
      nom: 'POS Lié',
      latitude: 4.2,
      longitude: 10.2,
      type_pos: 'LIÉ',
      statut: 'ACTIF',
      adresse: 'Rue C',
      ville: 'Ville Z',
      partenaire: { nom: 'Partenaire C' },
    },
    {
      id: 4,
      code_pos: 'POS-004',
      nom: 'POS Invalide',
      latitude: null, // Coordonnées invalides
      longitude: null,
      type_pos: 'NOUVEAU',
      statut: 'ACTIF',
    },
  ];

  it('renders MapContainer and TileLayer', () => {
    render(
      <MemoryRouter>
        <POSMap pos={[]} />
      </MemoryRouter>
    );
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
  });

  it('renders valid POS markers', () => {
    render(
      <MemoryRouter>
        <POSMap pos={mockPosList} />
      </MemoryRouter>
    );
    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(3); // 3 valid POS + 1 invalid
    expect(screen.getByTitle('POS-001 - POS Actif')).toBeInTheDocument();
    expect(screen.getByTitle('POS-002 - POS Reconduit')).toBeInTheDocument();
    expect(screen.getByTitle('POS-003 - POS Lié')).toBeInTheDocument();
  });

  it('displays invalid POS alert when there are invalid positions', () => {
    render(
      <MemoryRouter>
        <POSMap pos={mockPosList} />
      </MemoryRouter>
    );
    expect(screen.getByText('⚠️ POS sans coordonnées')).toBeInTheDocument();
    expect(screen.getByText('POS-004 — POS Invalide')).toBeInTheDocument();
  });

  it('calls onSelect when a marker is clicked', async () => {
    const handleSelect = vi.fn();
    render(
      <MemoryRouter>
        <POSMap pos={mockPosList.slice(0, 1)} onSelect={handleSelect} />
      </MemoryRouter>
    );
    const marker = screen.getByTitle('POS-001 - POS Actif');
    await userEvent.click(marker);
    // Expect a normalized object to be passed
    expect(handleSelect).toHaveBeenCalledWith(expect.objectContaining({
      id: mockPosList[0].id,
      code_pos: mockPosList[0].code_pos,
      nom: mockPosList[0].nom,
    }));
  });

  it('displays popup with correct information on marker click', async () => {
    render(
      <MemoryRouter>
        <POSMap pos={mockPosList.slice(0, 1)} selectedId={mockPosList[0].id} />
      </MemoryRouter>
    );

    // Le contenu du popup est scopé via data-testid="popup" (mock react-leaflet)
    const popup = screen.getByTestId('popup');

    expect(within(popup).getByText('POS-001')).toBeInTheDocument();
    expect(within(popup).getByText('POS Actif')).toBeInTheDocument();

    // Lignes composées : label en texte direct + libellé dans un span coloré
    expect(within(popup).getByText(/^Catégorie :/)).toBeInTheDocument();
    expect(within(popup).getByText('Créé')).toBeInTheDocument();

    expect(within(popup).getByText(/^Statut :/)).toBeInTheDocument();
    expect(within(popup).getByText('Actif')).toBeInTheDocument();

    expect(within(popup).getByText('Adresse : Rue A')).toBeInTheDocument();
    expect(within(popup).getByText('Ville : Ville X')).toBeInTheDocument();
    expect(within(popup).getByText('Partenaire : Partenaire A')).toBeInTheDocument();

    expect(
      within(popup).getByRole('link', { name: 'Voir les détails' })
    ).toHaveAttribute('href', '/pos/1');
  });

  it('renders category legend', () => {
    render(
      <MemoryRouter>
        <POSMap pos={[]} />
      </MemoryRouter>
    );
    expect(screen.getByText('Catégories')).toBeInTheDocument();
    expect(screen.getByText('Créé')).toBeInTheDocument();
    expect(screen.getByText('Reconduit')).toBeInTheDocument();
    expect(screen.getByText('Lié')).toBeInTheDocument();
  });
});
