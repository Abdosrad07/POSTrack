import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from '../Button/Button';

/**
 * État d'erreur réutilisable — design system polish.
 */
const ErrorState = ({
  title = 'Une erreur est survenue',
  message = 'Impossible de charger les données. Veuillez réessayer.',
  onRetry,
  retryLabel = 'Réessayer',
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200/60 bg-gradient-to-b from-red-50/80 to-white px-6 py-14 text-center animate-fade-in">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-500">
        <ExclamationTriangleIcon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold text-red-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-red-600">{message}</p>
      {onRetry && (
        <div className="mt-6">
          <Button type="button" variant="danger" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
