import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../../components/Common/EmptyState/EmptyState';
import PageHeader from '../../components/Common/PageHeader/PageHeader';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Accès non autorisé"
        subtitle="Votre rôle applicatif ne permet pas d'ouvrir cette page."
      />
      <EmptyState
        title="Permission insuffisante"
        message="Contactez un administrateur si vous pensez qu'il s'agit d'une erreur."
        actionLabel="Retour au dashboard"
        onAction={() => navigate('/')}
      />
      <p className="mt-4 text-center text-sm text-slate-500">
        <Link to="/" className="font-medium text-sky-700 hover:underline">
          Retour à l&apos;accueil
        </Link>
      </p>
    </div>
  );
};

export default UnauthorizedPage;
