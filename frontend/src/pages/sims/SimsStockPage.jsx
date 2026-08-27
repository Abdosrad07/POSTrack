import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/Common/PageHeader/PageHeader';
import EmptyState from '../../components/Common/EmptyState/EmptyState';
import ErrorState from '../../components/Common/ErrorState/ErrorState';
import LoadingSpinner from '../../components/Common/LoadingSpinner/LoadingSpinner';
import ExportButtons from '../../components/Common/ExportButtons/ExportButtons';
import { simService } from '../../services/simService';
import api from '../../services/api';

/** Colonnes du tableau / export Stock SIM — alignées sur SIMOut (backend). */
const EXPORT_COLUMNS = [
  { label: 'ICCID', value: 'iccid' },
  { label: 'Numéro MSISDN', value: 'numero_msisdn' },
  { label: 'ID POS', value: 'pos_id' },
  { label: 'POS (code)', value: 'pos.code_pos' },
  { label: 'POS (nom)', value: 'pos.name' },
  { label: 'Partenaire', value: 'partner_id' },
  { label: 'Statut', value: 'status' },
  { label: 'Créée le', value: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '') },
  { label: 'Mise à jour', value: (r) => (r.updated_at ? new Date(r.updated_at).toLocaleDateString('fr-FR') : '') },
];

const VUES = [
  { key: 'creation', label: 'Création' },
  { key: 'reconduction', label: 'Reconduction' },
  { key: 'inventaire', label: 'Inventaire' },
];

const STATUTS_SIM = ['EN_STOCK', 'ASSIGNEE', 'ACTIVE', 'RETOURNEE', 'PERDUE'];

/**
 * Page SIM dédiée : création (rattachement d'une carte neuve à un POS),
 * reconduction formelle (réaffectation à un nouveau POS) et inventaire
 * filtré du stock du partenaire actif.
 */
const SimsStockPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [poss, setPoss] = useState([]);
  const [view, setView] = useState('creation');
  const [busy, setBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  // Formulaire : création
  const [creationPosId, setCreationPosId] = useState('');
  const [iccid, setIccid] = useState('');
  const [numeroMsisdn, setNumeroMsisdn] = useState('');

  // Formulaire : reconduction
  const [reconductionSimId, setReconductionSimId] = useState('');
  const [reconductionPosId, setReconductionPosId] = useState('');
  const [reconductionMotif, setReconductionMotif] = useState('');

  // Filtre inventaire
  const [statusFilter, setStatusFilter] = useState('TOUS');

  const fetchSims = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await simService.getAll({ limit: 500 });
      setItems(response.data?.items ?? []);
    } catch (err) {
      setError(err?.apiMessage || err?.message || 'Impossible de charger le stock SIM.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSims();
  }, [fetchSims]);

  // Les POS alimentent les listes déroulantes des deux formulaires.
  useEffect(() => {
    let cancelled = false;
    api
      .get('/pos', { params: { limit: 500 } })
      .then((res) => {
        if (!cancelled) setPoss(res.data?.items ?? res.data?.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setPoss([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const possById = useMemo(() => new Map(poss.map((p) => [Number(p.id), p])), [poss]);
  const posLabel = (posId) => {
    const p = possById.get(Number(posId));
    return p ? `${p.code_pos} — ${p.name}` : `POS #${posId}`;
  };

  const filteredRows = useMemo(
    () =>
      statusFilter === 'TOUS'
        ? items
        : items.filter((item) => String(item.status ?? item.statut).toUpperCase() === statusFilter),
    [items, statusFilter]
  );

  const handleCreateSim = async (e) => {
    e.preventDefault();
    if (!creationPosId || !iccid.trim()) return;
    setBusy(true);
    setActionError('');
    setActionMessage('');
    try {
      await simService.create({ pos_id: Number(creationPosId), iccid: iccid.trim(), numero_msisdn: numeroMsisdn.trim() || null });
      setActionMessage(`SIM ${iccid.trim()} créée et rattachée au stock.`);
      setIccid('');
      setNumeroMsisdn('');
      void fetchSims();
    } catch (err) {
      setActionError(err?.apiMessage || err?.response?.data?.detail || 'Impossible de créer la SIM.');
    } finally {
      setBusy(false);
    }
  };

  const handleReconduire = async (e) => {
    e.preventDefault();
    if (!reconductionSimId || !reconductionPosId) return;
    setBusy(true);
    setActionError('');
    setActionMessage('');
    try {
      await simService.reconduire(Number(reconductionSimId), {
        new_pos_id: Number(reconductionPosId),
        motif: reconductionMotif || null,
      });
      setActionMessage('SIM reconduite vers le nouveau POS.');
      setReconductionSimId('');
      setReconductionPosId('');
      setReconductionMotif('');
      void fetchSims();
    } catch (err) {
      setActionError(err?.apiMessage || err?.response?.data?.detail || 'Impossible de reconduire la SIM.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Stock SIM"
        subtitle="Création, reconduction et inventaire des cartes SIM du partenaire actif."
        breadcrumbs={['Espace partenaire', 'Stock SIM']}
      />

      <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        {VUES.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              view === v.key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {(actionMessage || actionError) && (
        <div className={`mb-4 rounded-md px-4 py-3 text-sm ${actionError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {actionError || actionMessage}
        </div>
      )}

      {view === 'creation' && (
        <form onSubmit={handleCreateSim} className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[2fr_2fr_2fr_auto]">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">POS destinataire</span>
            <select value={creationPosId} onChange={(e) => setCreationPosId(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm" required>
              <option value="">— Choisir un POS —</option>
              {poss.map((p) => (
                <option key={p.id} value={String(p.id)}>{p.code_pos} — {p.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">ICCID</span>
            <input value={iccid} onChange={(e) => setIccid(e.target.value)} placeholder="892370..." className="rounded-md border border-slate-300 px-3 py-2 text-sm" required />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Numéro de téléphone</span>
            <input value={numeroMsisdn} onChange={(e) => setNumeroMsisdn(e.target.value)} placeholder="699..." className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <div className="flex items-end">
            <button disabled={busy || !creationPosId || !iccid.trim()} className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              Créer la SIM
            </button>
          </div>
          <p className="text-xs text-slate-500 sm:col-span-4">
            La création consomme une unité du stock du POS sélectionné (erreur si stock épuisé).
          </p>
        </form>
      )}

      {view === 'reconduction' && (
        <form onSubmit={handleReconduire} className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[2fr_2fr_2fr_auto]">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">SIM à reconduire</span>
            <select value={reconductionSimId} onChange={(e) => setReconductionSimId(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm" required>
              <option value="">— Choisir une SIM —</option>
              {items.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.numero_msisdn || s.iccid} · {s.status ?? s.statut} · {posLabel(s.pos_id)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Nouveau POS</span>
            <select value={reconductionPosId} onChange={(e) => setReconductionPosId(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm" required>
              <option value="">— Choisir un POS —</option>
              {poss.map((p) => (
                <option key={p.id} value={String(p.id)}>{p.code_pos} — {p.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Motif (optionnel)</span>
            <input value={reconductionMotif} onChange={(e) => setReconductionMotif(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <div className="flex items-end">
            <button disabled={busy || !reconductionSimId || !reconductionPosId} className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              Reconduire
            </button>
          </div>
          <p className="text-xs text-slate-500 sm:col-span-4">
            La reconduction réaffecte la carte à un autre POS du partenaire et trace un mouvement RECEPTION sur le POS destinataire.
          </p>
        </form>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 shadow-sm">
          <LoadingSpinner label="Chargement du stock SIM..." />
        </div>
      ) : error ? (
        <ErrorState title="Erreur de chargement" message={error} onRetry={fetchSims} />
      ) : view === 'inventaire' && filteredRows.length === 0 ? (
        <EmptyState
          title="Aucune SIM dans l'inventaire"
          message="Aucune carte SIM ne correspond au filtre de statut pour ce partenaire."
          icon="📶"
        />
      ) : view === 'inventaire' ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
            <span className="text-sm text-slate-600">{filteredRows.length} SIM affichées</span>
            <label className="flex items-center gap-2 text-sm">
              <span className="font-medium text-slate-700">Statut</span>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1 text-sm">
                <option value="TOUS">Tous</option>
                {STATUTS_SIM.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <ExportButtons
              rows={items}
              columns={EXPORT_COLUMNS}
              fileName="stock-sim"
              title="Inventaire Stock SIM"
              disabled={loading}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Numéro de téléphone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">POS</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Créée le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredRows.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.numero_msisdn || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.pos_id != null ? posLabel(item.pos_id) : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.status ?? item.statut ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SimsStockPage;