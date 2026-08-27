import React from 'react';

const VARIANT_CLASSES = {
  primary: 'btn-primary',
  indigo: 'btn-indigo',
  success: 'btn-success',
  green: 'btn-success',
  danger: 'btn-danger',
  red: 'btn-danger',
  warning: 'btn-warning',
  amber: 'btn-warning',
  secondary: 'btn-secondary',
  gray: 'btn-gray',
  ghost: 'btn-ghost',
};

const SIZE_CLASSES = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

/**
 * Bouton réutilisable avec variantes et tailles.
 */
const Button = ({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
  size = 'md',
  ...props
}) => {
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;
  const sizeClass = SIZE_CLASSES[size] || '';

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
