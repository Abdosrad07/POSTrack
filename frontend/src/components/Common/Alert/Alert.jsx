import React from 'react';

const TYPE_STYLES = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: '💡',
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon: '✓',
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: '✕',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: '⚠',
  },
};

const Alert = ({ type = 'info', message, onClose }) => {
  const style = TYPE_STYLES[type] || TYPE_STYLES.info;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium animate-fade-in ${style.container}`}
      role="alert"
    >
      <span className="text-base shrink-0" aria-hidden="true">{style.icon}</span>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 rounded-md p-1 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Fermer"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
