import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { NAV_ITEMS } from '../../utils/constants';
import { filterNavByRole } from '../../utils/roles';

/**
 * Navigation latérale filtrée par rôle R7 (Module A2).
 */
const Sidebar = ({ open = false, onClose }) => {
  const { user } = useAuth();
  const items = useMemo(() => filterNavByRole(NAV_ITEMS, user), [user]);

  return (
    <>
      {/* Overlay mobile */}
      <div
        className={`fixed inset-0 z-30 bg-slate-900/40 transition-opacity md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white pt-16 transition-transform duration-200 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigation principale"
      >
        <div className="border-b border-slate-100 px-4 py-3 md:hidden">
          <p className="text-sm font-semibold text-slate-800">Menu</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-400">
          POSTrack · v3.1-R7
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
