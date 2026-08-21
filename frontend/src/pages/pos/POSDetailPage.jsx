import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import posService from '../../services/posService';
import StatusBadge from '../../components/Common/StatusBadge';

// Onglets qui pointent vers des modules hors de ton lot de travail (Reconductions,
// Primes, SIM / Requêtes) — simples liens d'intégration, pas de logique ici.
const LIENS_EXTERNES = [
  { label: 'Reconductions', href: (id) => `/pos/${id}/reconductions` },
  { label: 'Primes', href: (id) => `/pos/${id}/primes` },
  { label: 'SIM', href: (id) => `/pos/${id}/sims` },
];

export default function POSDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pos, setPos] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [changingStatus, setChangingStatus] = useState(false);

  useEffect(() => {
    setStatus('loading');
    posService
      .getById(id)
      .then((res) => { setPos(res.data); setStatus('success'); })
      .catch(() => { setError('POS introuvable.'); setStatus('error'); });
  }, [id]);

  const handleStatusChange = async (statut) => {
    setChangingStatus(true);
    try {
      const res = await posService.changeStatus(id, statut);
      setPos(res.data);
    } finally {
      setChangingStatus(false);
    }
  };

  if (status === 'loading') return <p className="text-gray-400">Chargement...</p>;
  if (status === 'error') return <p className="text-red-600">{error}</p>;
  if (!pos) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">Détail POS</p>
          <h1 className="text-2xl font-semibold text-gray-900">{pos.code_pos} — {pos.nom}</h1>
          <div className="mt-2 flex items-center gap-2">
            <StatusBadge statut={pos.statut} />
            <span className={`text-xs font-medium ${pos.type === 'RECONDUIT' ? 'text-gray-500' : 'text-emerald-700'}`}>
              {pos.type}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => navigate(`/pos/${id}/edit`)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Modifier
          </button>
          {pos.statut === 'ACTIF' && (
            <button disabled={changingStatus} onClick={() => handleStatusChange('SUSPENDU')} className="rounded-md border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50">
              Suspendre
            </button>
          )}
          {pos.statut !== 'CLOTURE' && (
            <button disabled={changingStatus} onClick={() => handleStatusChange('CLOTURE')} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              Clôturer
            </button>
          )}
        </div>
      </div>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoCard label="Partenaire" value={pos.partenaire?.nom ?? '—'} />
        <InfoCard label="DSM" value={pos.dsm?.nom_complet ?? '—'} />
        <InfoCard label="Date de création" value={pos.date_creation} />
        <InfoCard label="Date d'expiration" value={pos.date_expiration} />
      </section>

      {/* Points d'ancrage vers les modules d'autres devs — pas de logique métier ici */}
      <div className="flex gap-3 border-t border-gray-200 pt-4">
        {LIENS_EXTERNES.map((lien) => (
          <button
            key={lien.label}
            onClick={() => navigate(lien.href(id))}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Voir {lien.label} →
          </button>
        ))}
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
