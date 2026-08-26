import React, { useEffect, useState } from 'react';
import posService from '../../services/posService';
import usePartner from '../../hooks/usePartner';

const formatInt = (value) => {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('fr-FR').format(Number(value));
};

const POSLinkageStatsCard = ({ dsmId = null }) => {
  const { partnerContextId } = usePartner();
  const [stats, setStats] = useState(null);
  const [typeStats, setTypeStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!partnerContextId) return;
      
      try {
        setLoading(true);
        const [linkageRes, typeRes] = await Promise.all([
          posService.getLinkageStats(dsmId),
          posService.getTypeStats(dsmId),
        ]);
        
        setStats(linkageRes.data);
        setTypeStats(typeRes.data);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques POS:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [partnerContextId, dsmId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const total = stats?.total || 0;
  const linked = stats?.linked || 0;
  const unlinked = stats?.unlinked || 0;
  const actifs = stats?.actifs || 0;
  const nouveau = typeStats?.NOUVEAU || 0;
  const reconduit = typeStats?.RECONDUIT || 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          {dsmId ? 'Statistiques POS DSM' : 'Statistiques POS Partenaire'}
        </h3>
        <p className="text-sm text-slate-500">
          {dsmId 
            ? 'POS créés, linkés, délinkés et actifs pour ce DSM' 
            : 'POS créés, linkés, délinkés et actifs pour le partenaire'}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">POS créés</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{formatInt(total)}</div>
          <div className="mt-1 text-xs text-slate-600">
            {nouveau} nouveaux + {reconduit} reconduits
          </div>
        </div>

        <div className="rounded-lg bg-emerald-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">POS linkés</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{formatInt(linked)}</div>
          <div className="mt-1 text-xs text-slate-600">
            Avec détenteur assigné
          </div>
        </div>

        <div className="rounded-lg bg-amber-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">POS délinkés</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{formatInt(unlinked)}</div>
          <div className="mt-1 text-xs text-slate-600">
            Sans détenteur assigné
          </div>
        </div>

        <div className="rounded-lg bg-indigo-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">POS actifs</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{formatInt(actifs)}</div>
          <div className="mt-1 text-xs text-slate-600">
            Statut ACTIF
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
        <strong>ℹ️ Distinction linkage :</strong> 
        POS linké = avec détenteur (holder_user_id), 
        POS délinké = sans détenteur.
      </div>
    </div>
  );
};

export default POSLinkageStatsCard;