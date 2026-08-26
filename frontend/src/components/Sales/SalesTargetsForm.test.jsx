import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SalesTargetsForm from './SalesTargetsForm';

describe('SalesTargetsForm', () => {
  it('affiche les champs et envoie les valeurs normalisées', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<SalesTargetsForm partnerName="Master Color" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Mois'), { target: { value: '2026-08' } });
    fireEvent.change(screen.getByLabelText('Objectif création'), { target: { value: '40' } });
    fireEvent.change(screen.getByLabelText('Objectif redéploiement'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Objectif sell-out'), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText('Objectif loading'), { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(onSubmit).toHaveBeenCalledWith({
      month: '2026-08',
      creation_target: 40,
      redeployment_target: 10,
      sell_out_target: 60,
      loading_target: 12,
      creation_stock_initial: null,
      redeployment_stock_initial: null,
    });
  });
});