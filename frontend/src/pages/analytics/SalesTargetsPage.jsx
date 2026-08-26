import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/Common/PageHeader/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../components/Common/EmptyState/EmptyState';
import ErrorState from '../../components/Common/ErrorState/ErrorState';
import SalesTargetsForm from '../../components/Sales/SalesTargetsForm';
import analyticsService from '../../services/analyticsService';
import usePartner from '../../hooks/usePartner';

export default function SalesTargetsPage() {
  const { partnerContextId, partner } = usePartner();
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!partnerContextId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await analyticsService.listSalesTargets(partnerContextId);
        if (!ignore) setTargets(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!ignore) setError(err?.response?.data?.detail || err?.message || 'Impossible de charger les objectifs.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    void load();
    return () => { ignore = true; };
  }, [partnerContextId]);

  const partnerName = partner?.nom || partner?.name || partner?.code_partenaire || partner?.code || 'Partenaire';
  const firstTarget = useMemo(() => targets?.[0] || null, [targets]);

  const handleSubmit = async (payload) => {
    if (!partnerContextId) return;
    setSaving(true);
    setError('');
    try {
      const res = await analyticsService.upsertSalesTarget(partnerContextId, payload);
      const updated = res.data;
      setTargets((current) => [updated, ...current.filter((item) => item.month !== updated.month)]);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Impossible d’enregistrer les objectifs.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Objectifs de ventes partenaire"
        subtitle={`Paramétrage des objectifs mensuels pour ${partnerName}.`}
        breadcrumbs={['Administration', 'Suivi des ventes', 'Objectifs']}
      />

      {loading ? <LoadingSpinner label="Chargement des objectifs..." /> : null}
      {!loading && error ? <ErrorState title="Erreur" message={error} onRetry={() => window.location.reload()} /> : null}
      {!loading && !error ? (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <SalesTargetsForm partnerName={partnerName} initialValues={firstTarget || undefined} submitting={saving} onSubmit={handleSubmit} />

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Objectifs enregistrés</h2>
            {targets.length === 0 ? (
              <EmptyState title="Aucun objectif" message="Aucun objectif n’a encore été défini pour ce partenaire." />
            ) : (
              <ul className="space-y-3">
                {targets.map((target) => (
                  <li key={target.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                    <div className="font-semibold text-slate-900">{new Date(`${target.month}T00:00:00`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
                    <div className="mt-2 grid gap-1 text-slate-600">
                      <div>Création : {target.creation_target ?? 'Non renseigné'}</div>
                      <div>Redéploiement : {target.redeployment_target ?? 'Non renseigné'}</div>
                      <div>Sell-out : {target.sell_out_target ?? 'Non renseigné'}</div>
                      <div>Loading : {target.loading_target ?? 'Non renseigné'}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}