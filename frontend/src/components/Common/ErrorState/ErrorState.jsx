import React from 'react';
import Button from '../Button/Button';

/**
 * État d'erreur réutilisable (Module A2).
 */
const ErrorState = ({
  title = 'Une erreur est survenue',
  message = 'Impossible de charger les données. Veuillez réessayer.',
  onRetry,
  retryLabel = 'Réessayer',
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">
        !
      </div>
      <h3 className="text-lg font-semibold text-red-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-red-700">{message}</p>
      {onRetry && (
        <div className="mt-6">
          <Button type="button" variant="red" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
