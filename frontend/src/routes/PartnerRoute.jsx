import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import usePartner from '../hooks/usePartner';
import LoadingSpinner from '../components/Common/LoadingSpinner/LoadingSpinner';

/**
 * Protège les routes métier : authentification JWT + PartnerContext obligatoire.
 */
const PartnerRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { hasPartner } = usePartner();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen label="Chargement..." />;
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
