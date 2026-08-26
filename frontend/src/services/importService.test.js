import { describe, expect, it, vi } from 'vitest';

vi.mock('./api', () => ({
  __esModule: true,
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
  applyPartnerPrefix: (url, partnerId) =>
    partnerId ? `/partners/${partnerId}${url.startsWith('/') ? url : `/${url}`}` : url,
}));

import api from './api';
import { importService } from './importService';

const makeFile = (name = 'import-pos.xlsx') =>
  new File(['content'], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

describe('importService — Module A3', () => {
  it('valide un fichier via POST /imports/validate avec une requête multipart', async () => {
    const payload = {
      id: 'batch-1',
      entity_type: 'POS',
      file_name: 'import-pos.xlsx',
      status: 'VALIDATED',
      columns: ['nom_pos'],
      rows: [],
      errors: [],
      warnings: [],
      summary: { total_lines: 1, created: 1, updated: 0, errors: 0, warnings: 0, status: 'VALIDATED' },
    };
    api.post.mockResolvedValueOnce({ data: { data: payload } });

    const res = await importService.validate('POS', makeFile());

    expect(api.post).toHaveBeenCalledTimes(1);
    const [url, body, config] = api.post.mock.calls[0];
    expect(url).toBe('/imports/validate');
    expect(body).toBeInstanceOf(FormData);
    expect(config.headers['Content-Type']).toBe('multipart/form-data');
    expect(res).toMatchObject({ id: 'batch-1', entity_type: 'POS', status: 'VALIDATED' });
    expect(res.summary.created).toBe(1);
  });

  it("propage l'erreur réseau au lieu de simuler un lot (source de vérité serveur)", async () => {
    api.post.mockRejectedValueOnce({ code: 'ERR_NETWORK' });

    await expect(importService.validate('POS', makeFile('offline.xlsx'))).rejects.toEqual({
      code: 'ERR_NETWORK',
    });
  });

  it('commit le lot via POST /imports/{batch_id}/apply', async () => {
    api.post.mockResolvedValueOnce({ data: { data: { id: 'batch-1', status: 'APPLIED' } } });

    const res = await importService.apply('batch-1');

    expect(api.post).toHaveBeenCalledWith('/imports/batch-1/apply', {});
    expect(res).toMatchObject({ id: 'batch-1', status: 'APPLIED' });
  });

  it('ne confirme jamais un lot si le backend est indisponible (pas de faux APPLIED)', async () => {
    api.post.mockRejectedValueOnce({ code: 'ERR_NETWORK' });

    await expect(importService.apply('batch-1')).rejects.toEqual({ code: 'ERR_NETWORK' });
  });

  it('construit l URL du gabarit préfixée par le partenaire courant', () => {
    localStorage.setItem('partner_context_id', '3');
    const url = importService.getTemplateUrl('POS');
    expect(url).toContain('/api/partners/3/imports/templates/POS');
  });

  it('normalise une réponse Backend minimale vers la forme attendue par l UI', async () => {
    api.post.mockResolvedValueOnce({ data: { data: { id: 'b2', status: 'VALIDATED' } } });

    const res = await importService.validate('CLIENT', makeFile());

    expect(res.entity_type).toBe('CLIENT');
    expect(res.columns).toEqual([]);
    expect(res.rows).toEqual([]);
  });
});
