import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Fil d'Ariane simple (Module A2).
 * @param {{ label: string, to?: string }[]} items
 */
const Breadcrumb = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <nav className="mb-3 text-sm text-slate-500" aria-label="Fil d'Ariane">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 ? <span className="text-slate-300">/</span> : null}
              {item.to && !isLast ? (
                <Link to={item.to} className="hover:text-sky-700 hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'font-medium text-slate-700' : ''}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
