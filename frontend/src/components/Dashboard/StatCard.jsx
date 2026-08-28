import React from 'react';
import { ArrowDownRightIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';

const ACCENT_CONFIG = {
  default: {
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    valueColor: 'text-slate-900',
    border: 'border-slate-200/80',
    glow: '',
  },
  indigo: {
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    valueColor: 'text-indigo-600',
    border: 'border-indigo-200/60',
    glow: 'hover:shadow-indigo-500/5',
  },
  green: {
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    valueColor: 'text-emerald-600',
    border: 'border-emerald-200/60',
    glow: 'hover:shadow-emerald-500/5',
  },
  amber: {
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    valueColor: 'text-amber-600',
    border: 'border-amber-200/60',
    glow: 'hover:shadow-amber-500/5',
  },
  red: {
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    valueColor: 'text-red-600',
    border: 'border-red-200/60',
    glow: 'hover:shadow-red-500/5',
  },
  sky: {
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    valueColor: 'text-sky-600',
    border: 'border-sky-200/60',
    glow: 'hover:shadow-sky-500/5',
  },
};

/**
 * Carte KPI — design system POSTrack v2.
 * `trend` : { value: '+12 %', direction: 'up'|'down', positive?: boolean, label?: string }
 * `positive` (défaut : up=positif, down=négatif) inverse la couleur pour les
 * indicateurs où une hausse est mauvaise (ex. requêtes ouvertes).
 */
const StatCard = ({
  label,
  value,
  loading = false,
  accent = 'default',
  icon = undefined,
  subtitle = '',
  small = false,
  trend = undefined,
  className = '',
}) => {
  const config = ACCENT_CONFIG[accent] || ACCENT_CONFIG.default;
  const trendPositive = trend ? trend.positive ?? trend.direction !== 'down' : true;

  if (loading) {
    return (
      <div
        className={`card overflow-hidden transition-shadow duration-200 ${config.border} ${className}`}
      >
        <div className={small ? 'p-4' : 'p-5'}>
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-24 rounded" />
              <div className={`skeleton rounded ${small ? 'h-7 w-16' : 'h-9 w-20'}`} />
              {subtitle && <div className="skeleton h-3 w-32 rounded" />}
            </div>
            {icon && <div className="skeleton h-10 w-10 rounded-xl" />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`card card-hover group overflow-hidden transition-all duration-200 ${config.border} ${config.glow} ${className}`}
    >
      <div className={small ? 'p-4' : 'p-5'}>
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {label}
            </p>
            <p
              className={`mt-1.5 font-extrabold tracking-tight ${config.valueColor} ${
                small ? 'text-2xl' : 'text-3xl'
              }`}
            >
              {value ?? '—'}
            </p>
            {trend && !loading ? (
              <p
                className={`mt-1 inline-flex items-center gap-0.5 text-xs font-semibold ${
                  trendPositive ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {trend.direction === 'down' ? (
                  <ArrowDownRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {trend.value}
                {trend.label ? <span className="ml-0.5 font-medium text-slate-400">{trend.label}</span> : null}
              </p>
            ) : null}
            {subtitle && (
              <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg transition-transform duration-200 group-hover:scale-110 ${config.iconBg} ${config.iconColor}`}
            >
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
