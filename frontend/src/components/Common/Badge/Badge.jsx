import React from 'react';

const VARIANT_CLASSES = {
  blue: 'badge-info',
  green: 'badge-success',
  red: 'badge-danger',
  yellow: 'badge-warning',
  indigo: 'badge-indigo',
  gray: 'badge-gray',
  sky: 'badge-sky',
  success: 'badge-success',
  danger: 'badge-danger',
  warning: 'badge-warning',
  info: 'badge-info',
};

const Badge = ({ children, count = 0, color = 'blue' }) => {
  const variantClass = VARIANT_CLASSES[color] || VARIANT_CLASSES.blue;

  return (
    <span className={`badge ${variantClass}`}>
      {count > 0 ? count : children}
    </span>
  );
};

export default Badge;
