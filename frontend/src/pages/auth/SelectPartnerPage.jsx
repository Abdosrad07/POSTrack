import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import usePartner from '../../hooks/usePartner';
import { partnerContextService } from '../../services/partnerContextService';
import { ROLE_LABELS } from '../../utils/constants';
import Button from '../../components/Common/Button/Button';
import Alert from '../../components/Common/Alert/Alert';

const SelectPartnerPage = () => {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { setPartner, hasPartner, partner } = usePartner();
  const navigate = useNavigate();

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectingId, setSelectingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadPartners = async () => {
      setLoading(true);
      setError('');
      try {
        const list = await partnerContextService.getAvailable(user);
        if (cancelled) return;
        setPartners(list);

        // Auto-sélection si un seul partenaire est autorisé
        if (list.length === 1) {
          setPartner(list[0]);
          navigate('/', { replace: true });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              'Impossible de charger les partenaires autorisés.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      loadPartners();
    }

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user, setPartner, navigate]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSelect = (item) => {
    setSelectingId(item.id);
    setPartner(item);
    navigate('/', { replace: true });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200 px-4 py-12">
      <div className="w-full max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-wide text-sky-700">POSTrack</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Sélection du partenaire</h1>
            <p className="mt-2 text-sm text-slate-600">
              Choisissez le contexte partenaire avant d&apos;accéder aux modules métier.
            </p>
          </div>
          <Button type="button" variant="gray" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>

        {user && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Connecté en tant que{' '}
            <span className="font-medium">{user.nom_complet || user.full_name || user.email}</span>
            {user.role && (
              <>
                {' '}
                — <span className="font-medium">{ROLE_LABELS[user.role] || user.role}</span>
              </>
            )}
          </div>
        )}

        {hasPartner && partner && (
          <Alert
            type="info"
            message={`Contexte actuel : ${partner.nom || partner.code_partenaire || partner.id}. Vous pouvez en choisir un autre.`}
          />
        )}

        {error && <Alert type="error" message={error} />}

        {loading ? (
          <div className="py-12 text-center text-slate-500">Chargement des partenaires...</div>
        ) : partners.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-slate-500">
            Aucun partenaire autorisé pour ce compte.
          </div>
        ) : (
          <ul className="space-y-3">
            {partners.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(item)}
                  disabled={selectingId === item.id}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-sky-400 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{item.nom}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.code_partenaire}
                      {item.ville ? ` · ${item.ville}` : ''}
                      {item.region ? ` · ${item.region}` : ''}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-sky-700">
                    {selectingId === item.id ? 'Sélection...' : 'Sélectionner'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SelectPartnerPage;
