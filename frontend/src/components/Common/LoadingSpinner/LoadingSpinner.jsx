import React from 'react';

const SIZE_CLASSES = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};

/**
 * Indicateur de chargement réutilisable (Module A2).
 */
const LoadingSpinner = ({
  size = 'md',
  fullScreen = false,
  label = 'Chargement...',
  className = '',
}) => {
  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${SIZE_CLASSES[size] || SIZE_CLASSES.md} animate-spin rounded-full border-sky-600 border-t-transparent`}
        role="status"
        aria-label={label}
      />
      {label ? <p className="text-sm font-medium text-slate-600">{label}</p> : null}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">{spinner}</div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
