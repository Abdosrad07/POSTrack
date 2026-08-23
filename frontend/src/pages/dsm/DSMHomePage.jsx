import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePartner from '../../hooks/usePartner';
import analyticsService from '../../services/analyticsService';
import dsmService from '../../services/dsmService';

const Tile = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
    <div className="mt-2 text-sm font-semibold text-slate-900">{value ?? '—'}</div>
  </div>
)

export default function DSMHomePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { partnerContextId } = usePartner();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dsm, setDsm] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [dsmRes, dashboardRes] = await Promise.all([
          dsmService.getById(id),
          analyticsService.getDashboard(partnerContextId, id),
        ]);
        if (!active) return;
        setDsm(dsmRes.data);
        setStats(dashboardRes.data);
      } catch (e) {
        if (!active) return;
        setError(e?.apiMessage || e?.message || 'Impossible de charger le tableau de bord DSM.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="text-slate-600">Chargement du DSM...</div>;
  if (error || !dsm) return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error || 'DSM introuvable.'}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{dsm.nom}</h1>
          <p className="mt-1 text-sm text-slate-600">Vue DSM filtrée sur son périmètre.</p>
        </div>
        <button type="button" onClick={() => navigate('/dsm')} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Retour</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="POS" value={stats?.pos_total} />
        <Tile label="POS actifs" value={stats?.pos_nouveau + stats?.pos_reconduit} />
        <Tile label="BTS" value={stats?.bts_saturees} />
        <Tile label="Requêtes ouvertes" value={stats?.requetes_ouvertes} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Données DSM</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Tile label="Nom" value={dsm.nom} />
          <Tile label="Email" value={dsm.email} />
          <Tile label="Région" value={dsm.region || dsm.zone} />
          <Tile label="Statut" value={dsm.statut} />
          <Tile label="Téléphone" value={dsm.telephone} />
        </div>
      </div>
    </div>
  );
}