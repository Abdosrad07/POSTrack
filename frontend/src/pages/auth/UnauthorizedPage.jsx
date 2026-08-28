import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon } from '@heroicons/react/24/outline';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-100 to-amber-100 text-red-500">
          <LockClosedIcon className="h-10 w-10" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Accès non autorisé</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          Votre rôle applicatif ne permet pas d&apos;ouvrir cette page.
          Contactez un administrateur si vous pensez qu&apos;il s&apos;agit d&apos;une erreur.
        </p>
        <div className="mt-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-primary px-6"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
