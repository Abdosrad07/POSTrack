import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getRoleLabel } from '../../utils/roles';
import Button from '../Common/Button/Button';
import HierarchyNavDropdown from './HierarchyNavDropdown';
import Logo from '../../assets/logos/LOGO.jpeg';

/**
 * En-tête applicatif : marque, navigation hiérarchique, utilisateur et déconnexion.
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
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 shadow-sm backdrop-blur-xl">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 md:hidden"
          onClick={onToggleSidebar}
          aria-label="Ouvrir le menu"
        >
          <span className="text-lg leading-none">☰</span>
        </button>
        <Link to="/" className="flex items-center gap-2">
          <img src={Logo} alt="POSTrack" className="h-9 w-9 rounded-lg object-cover" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">POSTrack</span>
        </Link>
        <div className="hidden sm:block h-6 w-px bg-slate-200" />
        <HierarchyNavDropdown />
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden max-w-[18rem] rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-right sm:block backdrop-blur-sm">
          <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
          <p className="truncate text-xs text-slate-500">{roleLabel}</p>
        </div>

        <Button type="button" variant="gray" className="text-sm" onClick={handleLogout}>
          Déconnexion
        </Button>
      </div>
    </header>
  );
};

export default Header;
