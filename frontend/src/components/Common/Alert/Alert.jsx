import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const TYPE_STYLES = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    Icon: InformationCircleIcon,
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    Icon: CheckCircleIcon,
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    Icon: XCircleIcon,
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-800',
    Icon: ExclamationTriangleIcon,
  },
};

const Alert = ({ type = 'info', message, onClose }) => {
  const style = TYPE_STYLES[type] || TYPE_STYLES.info;
  const { Icon } = style;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium animate-fade-in ${style.container}`}
      role="alert"
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 rounded-md p-1 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Fermer"
        >
          <XMarkIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default Alert;
