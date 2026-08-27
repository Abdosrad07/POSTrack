import React, { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import usePartner from '../../hooks/usePartner';
import { NAV_ITEMS } from '../../utils/constants';
import { filterNavByRole } from '../../utils/roles';

/**
 * Navigation latérale filtrée par rôle selon le nouveau modèle.
 */
const Sidebar = ({ open = false, onClose }) => {
  const { user } = useAuth();
  const { partner, clearPartner } = usePartner();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const items = useMemo(() => filterNavByRole(NAV_ITEMS, user), [user]);

  const handleLogout = async () => {
    await logout();
    onClose?.();
    navigate('/login', { replace: true });
  };

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
        <div className="border-b border-slate-100 px-4 py-3 md:hidden">
          <p className="text-sm font-semibold text-slate-800">Menu</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {partner ? (
            <button
              type="button"
              className="mb-4 w-full rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-sky-50 px-3 py-2.5 text-left text-sm transition-all hover:from-indigo-100 hover:to-sky-100"
              onClick={() => {
                clearPartner();
                navigate('/');
                onClose?.();
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Contexte actif</span>
              <p className="mt-0.5 truncate font-semibold text-slate-900">{partner.nom || partner.code_partenaire || `Partenaire #${partner.id}`}</p>
            </button>
          ) : null}
          {items.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {item.icon && (
                <span className={`text-base ${item.icon}`} aria-hidden="true" />
              )}
              {item.label}
            </NavLink>
          ))}
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
