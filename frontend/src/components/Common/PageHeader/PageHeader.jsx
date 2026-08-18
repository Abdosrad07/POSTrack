import React from 'react';

/**
 * En-tête de page standardisé (Module A2).
 */
const PageHeader = ({ title, subtitle, actions, breadcrumbs }) => {
  return (
    <div className="mb-6">
      {breadcrumbs?.length ? (
        <nav className="mb-2 text-sm text-slate-500" aria-label="Fil d'Ariane">
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb}-${index}`}>
              {index > 0 ? <span className="mx-1.5 text-slate-300">/</span> : null}
              <span className={index === breadcrumbs.length - 1 ? 'font-medium text-slate-700' : ''}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
};

export default PageHeader;
