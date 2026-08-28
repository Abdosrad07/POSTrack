import React from 'react';
import Button from '../Button/Button';

/**
 * État vide réutilisable — design system polish.
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-gradient-to-b from-slate-50/80 to-white px-6 py-14 text-center animate-fade-in">
      {icon ? (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
          {icon}
        </div>
      ) : (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
          📭
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      {body ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{body}</p>
      ) : null}
      {actionLabel && onAction ? (
        <div className="mt-6">
          <Button type="button" variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default EmptyState;
