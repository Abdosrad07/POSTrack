import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import usePartner from '../../hooks/usePartner';
import Button from '../../components/Common/Button/Button';
import Alert from '../../components/Common/Alert/Alert';
import { clearAuthSession } from '../../services/api';

const mockAccounts = [
  { label: 'Admin', username: 'admin', password: 'admin123' },
  { label: 'Manager', username: 'manager', password: 'manager123' },
  { label: 'Chef opérationnel', username: 'chef', password: 'chef123' },
  { label: 'Opérationnel', username: 'oper', password: 'oper123' },
];

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMock, setSelectedMock] = useState(null);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  let hasPartner = false;
  try {
    ({ hasPartner } = usePartner());
  } catch {
    hasPartner = false;
  }
  const navigate = useNavigate();

  if (!authLoading && isAuthenticated) {
    return <Navigate to={hasPartner ? '/' : '/select-partner'} replace />;
  }

  const goAfterLogin = () => {
    navigate('/select-partner', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      clearAuthSession();
      await login({ username, password });
      goAfterLogin();
    } catch (err) {
      if (err.isAuthExpired) {
        setError(
          'Votre session locale est obsolète ou le jeton a expiré. Veuillez vider la session et vous reconnecter.'
        );
      } else {
        setError(
          err.response?.data?.detail || 'Échec de la connexion. Veuillez vérifier vos identifiants.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMockSelect = (account) => {
    setUsername(account.username);
    setPassword(account.password);
    setError('');
    setSelectedMock(account);
  };

  const handleValidate = async () => {
    if (!selectedMock) return;
    setError('');
    setLoading(true);
    try {
      clearAuthSession();
      await login({ username: selectedMock.username, password: selectedMock.password });
      goAfterLogin();
    } catch (err) {
      if (err.isAuthExpired) {
        setError(
          'Votre session locale est obsolète ou le jeton a expiré. Veuillez vider la session et vous reconnecter.'
        );
      } else {
        setError(
          err.response?.data?.detail || 'Échec de la connexion. Veuillez vérifier vos identifiants.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900">POSTrack</h2>
          <p className="mt-2 text-center text-sm text-slate-600">Connectez-vous à votre compte</p>
        </div>
        {error && <Alert type="error" message={error} />}
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-800">Comptes de test rapides</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {mockAccounts.map((account) => (
              <Button
                key={account.username}
                type="button"
                variant="indigo"
                onClick={() => handleMockSelect(account)}
              >
                {account.label}
              </Button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Cliquez pour préremplir un compte mock et tester la connexion.
          </p>
        </div>
        {selectedMock && (
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600">
              Compte sélectionné: <span className="font-medium">{selectedMock.label}</span>
            </div>
            <Button type="button" variant="green" onClick={handleValidate}>
              Valider
            </Button>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Nom d&apos;utilisateur / Email
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
                placeholder="Entrez votre nom d'utilisateur"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
                placeholder="Entrez votre mot de passe"
              />
            </div>
          </div>

          <div>
            <Button type="submit" variant="indigo" className="w-full py-2">
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
