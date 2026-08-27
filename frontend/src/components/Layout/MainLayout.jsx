import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import PartnerSelectorBar from './PartnerSelectorBar';

/**
 * Layout principal responsive — Module A2.
 * Intègre Header, PartnerSelectorBar (sélecteur de partenaire permanent v3.4),
 * Sidebar (filtrée par rôle) et Outlet.
 */
const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 bg-mesh-pattern">
      <Header onToggleSidebar={() => setSidebarOpen((open) => !open)} />
      <div className="pt-16">
        <PartnerSelectorBar />
        <div className="relative flex">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="min-h-[calc(100vh-4rem)] flex-1 p-4 md:ml-64 md:p-6">
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
