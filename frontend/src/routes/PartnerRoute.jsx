import React from 'react';
import { Navigate } from 'react-router-dom';
import usePartner from '../hooks/usePartner';

/**
 * Protège seulement le contexte partenaire pour éviter les blocages de navigation.
 */
const PartnerRoute = ({ children }) => {
  const { hasPartner } = usePartner();

  if (!hasPartner) {
    return <Navigate to="/select-partner" replace />;
  }

  return children;
};

export default PartnerRoute;
