import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FileDropZone, { isAcceptedFile } from './FileDropZone';

const makeFile = (name = 'data.xlsx') =>
  new File(['content'], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

describe('isAcceptedFile', () => {
  it('accepte les fichiers Excel et CSV', () => {
    expect(isAcceptedFile(new File(['x'], 'a.xlsx'))).toBe(true);
    expect(isAcceptedFile(new File(['x'], 'a.csv'))).toBe(true);
    expect(isAcceptedFile(new File(['x'], 'a.xls'))).toBe(true);
  });

  it('rejette les formats non supportés', () => {
    expect(isAcceptedFile(new File(['x'], 'a.txt'))).toBe(false);
    expect(isAcceptedFile(new File(['x'], 'a.pdf'))).toBe(false);
  });
});

describe('FileDropZone', () => {
  it('affiche l état vide quand aucun fichier n est sélectionné', () => {
    render(<FileDropZone value={null} onChange={vi.fn()} />);
    expect(screen.getByText(/Glissez-déposez votre fichier/)).toBeInTheDocument();
  });

  it('propage le fichier sélectionné via onChange', () => {
    const onChange = vi.fn();
    render(<FileDropZone value={null} onChange={onChange} />);

    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [makeFile('export.xlsx')] } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].name).toBe('export.xlsx');
  });

  it('rejette un fichier au format non supporté sans appeler onChange', () => {
    const onChange = vi.fn();
    render(<FileDropZone value={null} onChange={onChange} />);

    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [makeFile('export.txt')] } });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/Format non supporté/)).toBeInTheDocument();
  });

  it('affiche le nom du fichier déjà sélectionné', () => {
    render(<FileDropZone value={makeFile('present.xlsx')} onChange={vi.fn()} />);
    expect(screen.getByText('present.xlsx')).toBeInTheDocument();
  });
});
