import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * Layout principal responsive — Module A2.
 * Intègre Header (avec le sélecteur de partenaire permanent v3.4),
 * Sidebar (filtrée par rôle) et Outlet.
 */
const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <Header onToggleSidebar={() => setSidebarOpen((open) => !open)} />
      <div className="pt-16">
        <div className="relative flex">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="min-h-[calc(100vh-4rem)] flex-1 p-4 md:ml-64 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
