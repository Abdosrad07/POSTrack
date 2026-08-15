import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import usePartner from '../hooks/usePartner';

/**
 * Protège les routes métier : authentification JWT + PartnerContext obligatoire.
 */
const PartnerRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { hasPartner } = usePartner();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="text-lg font-semibold text-slate-600">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasPartner) {
    return <Navigate to="/select-partner" state={{ from: location }} replace />;
  }

  return children;
};

export default PartnerRoute;
