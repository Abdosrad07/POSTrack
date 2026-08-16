import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getRoleLabel } from '../../utils/roles';
import Button from '../Common/Button/Button';

/**
 * En-tête applicatif : marque, utilisateur, rôle, déconnexion (Module A2).
 */
const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName =
    user?.nom_complet || user?.full_name || user?.email || 'Utilisateur';
  const roleLabel = getRoleLabel(user?.role);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 md:hidden"
          onClick={onToggleSidebar}
          aria-label="Ouvrir le menu"
        >
          <span className="text-lg leading-none">☰</span>
        </button>
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-sm font-bold text-white">
            P
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900">POSTrack</span>
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">{displayName}</p>
          <p className="text-xs text-slate-500">{roleLabel}</p>
        </div>
        <Button type="button" variant="gray" className="text-sm" onClick={handleLogout}>
          Déconnexion
        </Button>
      </div>
    </header>
  );
};

export default Header;
