import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import usePartner from '../hooks/usePartner';
import LoadingSpinner from '../components/Common/LoadingSpinner/LoadingSpinner';

/**
 * Protège les routes métier : session authentifiée obligatoire, puis
 * contexte partenaire obligatoire.
 *  - Sans session valide   → /login
 *  - Sans partenaire sélectionné → /select-partner
 * Empêche les pages métier d'appeler des APIs protégées sans jeton
 * (erreur backend « Jeton d'authentification manquant. »).
 */
const PartnerRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { hasPartner } = usePartner();

  if (loading) {
    return <LoadingSpinner fullScreen label="Chargement de la session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPartner) {
    return <Navigate to="/select-partner" replace />;
  }

  return children;
};

export default PartnerRoute;
