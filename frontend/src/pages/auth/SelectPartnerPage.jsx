import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import usePartner from '../../hooks/usePartner';
import { partnerContextService } from '../../services/partnerContextService';
import { ROLE_LABELS } from '../../utils/constants';
import Button from '../../components/Common/Button/Button';
import Alert from '../../components/Common/Alert/Alert';
import DemoDataBanner from '../../components/Common/DemoDataBanner/DemoDataBanner';

const SelectPartnerPage = () => {
  const { user, logout, loading: authLoading, isAuthenticated } = useAuth();
  const { setPartner, hasPartner, partner } = usePartner();
  const navigate = useNavigate();

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectingId, setSelectingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!user || !isAuthenticated) return;
    let cancelled = false;

    const loadPartners = async () => {
      setLoading(true);
      setError('');
      try {
        const list = await partnerContextService.getAvailable(user);
        if (cancelled) return;
        setPartners(list);

        // Auto-sélection si un seul partenaire est autorisé ou si aucun contexte
        // n'a encore été stocké et qu'un partenaire valide existe.
        if ((list.length === 1 || (!hasPartner && list.length > 0)) && list[0]) {
          setPartner(list[0]);
          setSelectedId(list[0].id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              'Impossible de charger les partenaires autorisés.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPartners();

    return () => {
      cancelled = true;
    };
  }, [user, isAuthenticated, setPartner, hasPartner]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Chargement...</p>
      </div>
    );
  }

  // Site protégé : sans session valide, ne pas interroger les APIs protégées
  // (le backend répondrait « Jeton d'authentification manquant. »).
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSelect = (item) => {
    setSelectingId(item.id);
    setPartner(item);
    setSelectedId(item.id);
    setSelectingId(null);
  };

  const handleConfirmSelection = () => {
    if (!selectedId) return;
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

        {(partners.some((p) => p.__mock) || partner?.__mock) && (
          <DemoDataBanner message="Le backend est indisponible : les partenaires affichés sont des données de démonstration." />
        )}

        {loading ? (
          <div className="py-12 text-center text-slate-500">Chargement des partenaires...</div>
        ) : partners.filter((item) => item?.id && (item?.nom || item?.name || item?.code_partenaire || item?.code)).length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-slate-500">
            Aucun partenaire autorisé pour ce compte.
          </div>
        ) : (
          <div className="space-y-4">
            <ul className="space-y-3">
              {partners
                .filter((item) => item?.id && (item?.nom || item?.name || item?.code_partenaire || item?.code))
                .map((item) => {
                  const partnerName = item.nom || item.name || item.raison_sociale || `Partenaire #${item.id}`;
                  const partnerCode = item.code_partenaire || item.code || '';

                  return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    disabled={selectingId === item.id}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${selectedId === item.id ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white hover:border-sky-400 hover:bg-sky-50'}`}
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{partnerName}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {partnerCode}
                        {item.ville ? ` · ${item.ville}` : ''}
                        {item.region ? ` · ${item.region}` : ''}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-sky-700">
                      {selectedId === item.id ? 'Sélectionné' : 'Sélectionner'}
                    </span>
                  </button>
                </li>
                  );
                })}
            </ul>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="green"
                onClick={handleConfirmSelection}
                disabled={!selectedId}
              >
                Continuer
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectPartnerPage;
