import React, { useEffect, useState } from 'react';
import posService from '../../services/posService';
import usePartner from '../../hooks/usePartner';
import { CheckBadgeIcon, LinkIcon, LockOpenIcon, MapPinIcon } from '@heroicons/react/24/outline';

const formatInt = (value) => {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('fr-FR').format(Number(value));
};

const STAT_CONFIGS = [
  { key: 'total', label: 'POS créés', bg: 'bg-sky-50/80', border: 'border-sky-100', accent: 'text-sky-600', Icon: MapPinIcon, sub: (n, r) => `${n} nouveaux + ${r} reconduits` },
  { key: 'linked', label: 'POS linkés', bg: 'bg-emerald-50/80', border: 'border-emerald-100', accent: 'text-emerald-600', Icon: LinkIcon, sub: () => 'Avec détenteur assigné' },
  { key: 'unlinked', label: 'POS délinkés', bg: 'bg-amber-50/80', border: 'border-amber-100', accent: 'text-amber-600', Icon: LockOpenIcon, sub: () => 'Sans détenteur assigné' },
  { key: 'actifs', label: 'POS actifs', bg: 'bg-indigo-50/80', border: 'border-indigo-100', accent: 'text-indigo-600', Icon: CheckBadgeIcon, sub: () => 'Statut ACTIF' },
];

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
      <div className="card overflow-hidden">
        <div className="card-header">
          <div className="skeleton h-4 w-48 rounded" />
          <div className="skeleton mt-1 h-3 w-64 rounded" />
        </div>
        <div className="card-body grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl bg-slate-50 p-4">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton mt-2 h-8 w-16 rounded" />
              <div className="skeleton mt-1 h-3 w-28 rounded" />
            </div>
          ))}
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
  const values = [total, linked, unlinked, actifs];
  const subs = [`${nouveau} nouveaux + ${reconduit} reconduits`, 'Avec détenteur assigné', 'Sans détenteur assigné', 'Statut ACTIF'];

  return (
    <div className="card overflow-hidden">
      <div className="card-header">
        <h3 className="text-lg font-bold text-slate-900">
          {dsmId ? 'Statistiques POS DSM' : 'Statistiques POS Partenaire'}
        </h3>
        <p className="text-xs text-slate-500">
          {dsmId
            ? 'POS créés, linkés, délinkés et actifs pour ce DSM'
            : 'POS créés, linkés, délinkés et actifs pour le partenaire'}
        </p>
      </div>

      <div className="card-body grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CONFIGS.map((cfg, i) => (
          <div
            key={cfg.key}
            className={`rounded-xl border ${cfg.bg} ${cfg.border} p-4 transition-all duration-200 hover:shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{cfg.label}</span>
              <cfg.Icon className={`h-5 w-5 ${cfg.accent}`} aria-hidden="true" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900">{formatInt(values[i])}</div>
            <div className="mt-1 text-xs font-medium text-slate-600">{subs[i]}</div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 px-5 py-3">
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Distinction linkage :</span>{' '}
          POS linké = avec détenteur (holder_user_id), POS délinké = sans détenteur.
        </p>
      </div>
    </div>
  );
};

export default POSLinkageStatsCard;
