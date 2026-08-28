import React, { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import usePartner from '../../hooks/usePartner';
import useNavigationLevel from '../../hooks/useNavigationLevel';
import { NAV_ITEMS } from '../../utils/constants';
import { filterNavByRole } from '../../utils/roles';

/**
 * Navigation latérale filtrée par rôle et niveau hiérarchique.
 * 
 * - Niveau Partenaire : toutes les fonctionnalités
 * - Niveau DSM : fonctionnalités DSM
 * - Niveau POS : fonctionnalités POS
 */
const Sidebar = ({ open = false, onClose }) => {
  const { user } = useAuth();
  const { partner, clearPartner } = usePartner();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { level, isPartner, isDsm, isPos } = useNavigationLevel();

  const items = useMemo(() => {
    // Filtrer par niveau hiérarchique
    const levelItems = NAV_ITEMS.filter((item) => item.level === level);
    // Puis filtrer par rôle
    return filterNavByRole(levelItems, user);
  }, [user, level]);

  const handleLogout = async () => {
    await logout();
    onClose?.();
    navigate('/login', { replace: true });
  };

  const handleClearContext = () => {
    clearPartner();
    navigate('/');
    onClose?.();
  };

  // Couleur d'accent selon le niveau
  const activeGradient = isDsm
    ? 'from-violet-500 to-purple-600 shadow-violet-500/25'
    : isPos
      ? 'from-emerald-500 to-teal-600 shadow-emerald-500/25'
      : 'from-indigo-500 to-indigo-600 shadow-indigo-500/25';

  return (
    <>
      {/* Overlay mobile */}
      <div
        className={`fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm transition-all md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/80 bg-white/95 pt-16 backdrop-blur-xl transition-transform duration-300 ease-out md:translate-x-0 ${
          open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        aria-label="Navigation principale"
      >
        {/* En-tête niveau */}
        <div className={`border-b px-4 py-3 ${isDsm ? 'border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50' : isPos ? 'border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50' : 'border-slate-100'}`}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {isDsm ? 'DSM' : isPos ? 'POS' : 'Partenaire'}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800">Navigation</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {/* Contexte partenaire actif */}
          {partner && (
            <button
              type="button"
              className="mb-4 w-full rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-sky-50 px-3 py-2.5 text-left text-sm transition-all hover:from-indigo-100 hover:to-sky-100"
              onClick={handleClearContext}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Contexte actif</span>
              <p className="mt-0.5 truncate font-semibold text-slate-900">
                {partner.nom || partner.code_partenaire || `Partenaire #${partner.id}`}
              </p>
            </button>
          )}

          {/* Éléments de navigation */}
          {items.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${activeGradient} text-white shadow-lg`
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >

              <span>{item.label}</span>
            </NavLink>
          ))}

          {items.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <p className="text-sm text-slate-500">Aucune navigation disponible</p>
            </div>
          )}
        </nav>

        <div className="border-t border-slate-100 px-4 py-4">
          <div className="mb-3 text-center">
            <span className="section-label text-slate-400">POSTrack · v3.1-R7</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 transition-all hover:border-red-200 hover:bg-red-100 hover:text-red-700 hover:shadow-sm"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">←</span>
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
