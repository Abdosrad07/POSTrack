import React from 'react';
import Button from '../Button/Button';

/**
 * État vide réutilisable (Module A2).
 */
const EmptyState = ({
  title = 'Aucune donnée',
  message = 'Aucun élément à afficher pour le moment.',
  description,
  icon,
  actionLabel,
  onAction,
}) => {
  const body = description || message;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      {icon ? <div className="mb-4 text-4xl text-slate-400">{icon}</div> : null}
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      {body ? <p className="mt-2 max-w-md text-sm text-slate-500">{body}</p> : null}
      {actionLabel && onAction ? (
        <div className="mt-6">
          <Button type="button" variant="indigo" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default EmptyState;
