import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/Common/Button/Button';
import Alert from '../../components/Common/Alert/Alert';

const mockAccounts = [
  { label: 'Admin', username: 'admin', password: 'admin123' },
  { label: 'Manager', username: 'manager', password: 'manager123' },
  { label: 'DSM', username: 'dsm', password: 'dsm123' },
  { label: 'Viewer', username: 'viewer', password: 'viewer123' },
];

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMock, setSelectedMock] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ username, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Échec de la connexion. Veuillez vérifier vos identifiants.'
      );
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
      await login({ username: selectedMock.username, password: selectedMock.password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Échec de la connexion. Veuillez vérifier vos identifiants.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">POSTrack</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Connectez-vous à votre compte</p>
        </div>
        {error && <Alert type="error" message={error} />}
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-800">Comptes de test rapides</p>
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
          <p className="mt-3 text-xs text-gray-500">Cliquez pour préremplir un compte mock et tester la connexion.</p>
        </div>
        {selectedMock && (
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">Compte sélectionné: <span className="font-medium">{selectedMock.label}</span></div>
            <Button type="button" variant="green" onClick={handleValidate}>Valider</Button>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur / Email</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Entrez votre nom d'utilisateur"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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

