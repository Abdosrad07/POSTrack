import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import usePartner from '../../hooks/usePartner';
import Alert from '../../components/Common/Alert/Alert';
import { clearAuthSession } from '../../services/api';
import Logo from '../../assets/logos/LOGO.jpeg';

const mockAccounts = [
  { label: 'Admin', username: 'admin', password: 'admin123', icon: '👑' },
  { label: 'Manager', username: 'manager', password: 'manager123', icon: '📊' },
  { label: 'Chef opérationnel', username: 'chef', password: 'chef123', icon: '🔧' },
  { label: 'Opérationnel', username: 'oper', password: 'oper123', icon: '⚙️' },
];

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  let hasPartner = false;
  try {
    ({ hasPartner } = usePartner());
  } catch {
    hasPartner = false;
  }
  const navigate = useNavigate();

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
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-mesh-pattern px-4 py-12 sm:px-6 lg:px-8">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-brand-400/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-md animate-fade-in-scale">
        {/* Main card */}
        <div className="glass-strong overflow-hidden rounded-3xl border border-white/60 shadow-xl">
          {/* Header with gradient accent */}
          <div className="bg-gradient-brand relative overflow-hidden px-8 pb-8 pt-10 text-center">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />

            <div className="relative">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 p-2 shadow-lg backdrop-blur-sm">
                <img
                  src={Logo}
                  alt="POSTrack logo"
                  className="h-16 w-auto rounded-xl object-cover"
                />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                POSTrack
              </h2>
              <p className="mt-1.5 text-sm font-medium text-indigo-100">
                Plateforme de gestion des points de vente
              </p>
            </div>
          </div>

          {/* Form body */}
          <div className="px-8 py-8">
            <p className="mb-6 text-center text-sm font-medium text-slate-500">
              Connectez-vous à votre compte
            </p>

            {error && (
              <div className="mb-5">
                <Alert type="error" message={error} />
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Nom d&apos;utilisateur / Email
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  placeholder="Entrez votre nom d'utilisateur"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Entrez votre mot de passe"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3 text-base shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Connexion en cours...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            {/* Demo accounts section */}
            <div className="mt-7">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 font-semibold uppercase tracking-wider text-slate-400">
                    Comptes de démo
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {mockAccounts.map((account) => (
                  <button
                    key={account.username}
                    type="button"
                    onClick={() => handleMockSelect(account)}
                    className={`group flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                      username === account.username
                        ? 'border-brand-300 bg-brand-50 text-brand-700 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-600 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-base">{account.icon}</span>
                    <span>{account.label}</span>
                  </button>
                ))}
              </div>

              <p className="mt-3 text-center text-xs text-slate-400">
                Sélectionnez un compte, puis cliquez sur « Se connecter »
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          POSTrack · Gestion de la chaîne Partenaire → DSM → BTS → POS
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
