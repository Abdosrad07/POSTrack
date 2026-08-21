import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { hasRole } from '../../utils/roles';
import EmptyState from '../Common/EmptyState/EmptyState';

/**
 * Garde d'affichage / de route selon la matrice des 4 rôles cibles.
 *
 * @param {Object} props — propriétés du composant
 * @param {string[]} [props.roles] — rôles autorisés (nouveaux rôles ou alias)
 * @param {React.ReactNode} [props.children]
 * @param {'redirect' | 'hide' | 'message'} [props.mode]
 * @param {string} [props.redirectTo]
 * @param {React.ReactNode} [props.fallback]
 */
const RoleGuard = ({
  roles = [],
  children,
  mode = 'redirect',
  redirectTo = '/unauthorized',
  fallback = null,
}) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (hasRole(user, roles)) {
    return children;
  }

  if (mode === 'hide') {
    return fallback;
  }

  if (mode === 'message') {
    return (
      fallback || (
        <EmptyState
          title="Accès refusé"
          message="Votre rôle ne permet pas d'accéder à cette section."
        />
      )
    );
  }

  return <Navigate to={redirectTo} replace />;
};

export default RoleGuard;
